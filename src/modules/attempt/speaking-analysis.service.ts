import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ATTEMPT_STATUS, PART_KIND, PartKind, SPEAKING_SESSION_MODE } from '~/common/constants/constants'
import { AzurePronunciationAssessmentProvider } from '~/infrastructure/providers/speech-assessment/azure.assessment'
import { SpeakingProducer } from '~/infrastructure/queues/publishers/speaking.producer'
import {
  AssessJobData,
  EvaluateJobData,
  ScoreSessionJobData,
  TranscribeJobData
} from '~/infrastructure/queues/types/speaking.job.types'
import { SpeechMapper } from './speech.mapper'
import { IAttemptRepository } from './attempt.repository.interface'
import { ISpeakingSessionRepository } from '../speaking-session/speaking-session.repository.interface'
import { ISTTProvider } from '~/infrastructure/providers/stt'
import { normalizeForAssessment } from '~/common/utils'
import { LLMEvaluator } from '~/infrastructure/providers/evaluator/llm-evaluator'
import { AttemptService } from './attempt.service'
import { SpeakingSessionService } from '../speaking-session/speaking-session.service'
import { ICacheService } from '~/infrastructure/cache'

@singleton()
export class SpeakingAnalysisService {
  constructor(
    @inject(TOKENS.ISTTProvider)
    private readonly sttProvider: ISTTProvider,
    private readonly assessmentProvider: AzurePronunciationAssessmentProvider,
    private readonly speechMapper: SpeechMapper,
    private readonly speakingProducer: SpeakingProducer,
    @inject(TOKENS.IAttemptRepository)
    private readonly attemptRepository: IAttemptRepository,
    @inject(TOKENS.ISpeakingSessionRepository)
    private readonly speakingSessionRepository: ISpeakingSessionRepository,
    private readonly speakingSessionService: SpeakingSessionService,
    private readonly llmEvaluator: LLMEvaluator,
    private readonly attemptService: AttemptService,
    @inject(TOKENS.ICacheService)
    private readonly cacheService: ICacheService
  ) {}

  // Job 1: Transcribe
  public async transcribe(data: TranscribeJobData): Promise<void> {
    const { attemptId, audioUrl, questionContent, part } = data
    await this.attemptRepository.updateById(attemptId, {
      status: ATTEMPT_STATUS.PROCESSING
    })

    const { transcript, duration } = await this.sttProvider.transcribe(audioUrl, questionContent)

    await this.attemptRepository.updateById(attemptId, {
      'evaluation.transcript': transcript
    })

    console.log('Finish transcribing at: ', Date.now())

    await this.speakingProducer.assess({
      attemptId,
      transcript: normalizeForAssessment(transcript),
      audioUrl,
      questionContent,
      part
    })
  }

  // Job 2: Assess
  public async assess(data: AssessJobData): Promise<void> {
    const { attemptId, transcript, audioUrl, questionContent, part } = data

    const result = await this.assessmentProvider.assess(audioUrl, transcript)
    const speechMetrics = this.speechMapper.toSpeechMetrics(result)

    await this.attemptRepository.updateById(attemptId, {
      'evaluation.transcript': result.transcript,
      speechMetrics
    })

    console.log('Finishing assessing at: ', Date.now())

    // Trigger job 3
    await this.speakingProducer.evaluate({
      attemptId,
      transcript: result.transcript,
      questionContent,
      speechMetrics,
      part
    })
  }

  // Job 3: LLM chấm điểm
  async evaluate(data: EvaluateJobData): Promise<void> {
    const { attemptId, questionContent, speechMetrics, transcript, part } = data

    const evaluation = await this.llmEvaluator.evaluate({
      question: questionContent,
      speechMetrics,
      transcript,
      part
    })

    const updatedAttempt = await this.attemptRepository.updateById(attemptId, {
      $set: {
        'evaluation.fluency': evaluation.fluency,
        'evaluation.pronunciation': evaluation.pronunciation,
        'evaluation.lexical': evaluation.lexical,
        'evaluation.grammar': evaluation.grammar,
        'evaluation.overall': evaluation.overall,
        status: ATTEMPT_STATUS.DONE
      }
    })

    if (!updatedAttempt) throw new Error(`Attempt not found: ${attemptId}`)

    console.log(`Finish evaluating attempt ${attemptId} at: `, Date.now())

    if (updatedAttempt.mode === SPEAKING_SESSION_MODE.MOCK && updatedAttempt.speakingSessionId) {
      const sessionId = updatedAttempt.speakingSessionId.toString()
      const session = await this.speakingSessionService.findById(sessionId)

      let totalQuestions = 0
      if (session.questions.part1) {
        totalQuestions += session.questions.part1.reduce((sum, topic) => sum + topic.forecastQuestionIds.length, 0)
      }
      if (session.questions.part2) totalQuestions += 1
      if (session.questions.part3) totalQuestions += session.questions.part3.length

      const doneCount = await this.attemptRepository.count({
        speakingSessionId: sessionId,
        status: ATTEMPT_STATUS.DONE
      })
      console.log(`[Session ${sessionId}] Progress: ${doneCount} / ${totalQuestions}`)

      if (doneCount === totalQuestions) {
        console.log(`🎉 Kích hoạt tính điểm tổng cho Session: ${sessionId}`)
        await this.speakingProducer.scoreSession({ speakingSessionId: sessionId })
      }
    }
  }

  // ─── Job 4: Tổng hợp điểm session (mock only) ───────────────────────────────
  async scoreSession(data: ScoreSessionJobData): Promise<void> {
    const { speakingSessionId } = data
    const attempts = await this.attemptRepository.findMany({ speakingSessionId })

    // Tạm thời vẫn dùng logic check DONE cũ như bạn muốn
    const allDone = attempts.every((a) => a.status === ATTEMPT_STATUS.DONE)
    if (!allDone || attempts.length === 0) {
      console.warn(`[Job 4] Session ${speakingSessionId} chưa xong hoặc không có attempt. Bỏ qua.`)
      return
    }

    // 🌟 Hàm tiện ích: Tính trung bình của 1 tiêu chí cụ thể trong 1 mảng attempts
    const getCriteriaAvg = (atts: typeof attempts, key: 'fluency' | 'pronunciation' | 'lexical' | 'grammar') => {
      const validScores = atts.map((a) => a.evaluation?.[key]?.band).filter((b): b is number => b != null)
      return validScores.length > 0 ? validScores.reduce((sum, b) => sum + b, 0) / validScores.length : null
    }

    // 🌟 BƯỚC 1: LỌC ATTEMPTS THEO TỪNG PART
    const p1Attempts = attempts.filter((a) => a.part === PART_KIND.ONE)
    const p2Attempts = attempts.filter((a) => a.part === PART_KIND.TWO)
    const p3Attempts = attempts.filter((a) => a.part === PART_KIND.THREE)

    // 🌟 BƯỚC 2: TÍNH ĐIỂM 4 TIÊU CHÍ CHO TỪNG PART (Cân bằng trọng số)
    const criteriaKeys = ['fluency', 'pronunciation', 'lexical', 'grammar'] as const
    const sessionCriteriaScores: Record<string, number> = {}

    for (const key of criteriaKeys) {
      const p1Score = getCriteriaAvg(p1Attempts, key)
      const p2Score = getCriteriaAvg(p2Attempts, key)
      const p3Score = getCriteriaAvg(p3Attempts, key)

      // Lấy trung bình cộng của 3 part cho tiêu chí này
      const validPartScores = [p1Score, p2Score, p3Score].filter((s): s is number => s !== null)
      sessionCriteriaScores[key] =
        validPartScores.length > 0 ? validPartScores.reduce((sum, s) => sum + s, 0) / validPartScores.length : 0
    }

    // 🌟 BƯỚC 3: TÍNH OVERALL BAND THEO CHUẨN IELTS OFFICIAL
    // Điểm tổng = (Fluency + Pronunciation + Lexical + Grammar) / 4
    const sumOfCriteria = Object.values(sessionCriteriaScores).reduce((sum, score) => sum + score, 0)
    const finalAverage = sumOfCriteria / 4

    // Áp dụng luật làm tròn IELTS (Chẵn hoặc rưỡi)
    const overallBand = this._roundToHalf(finalAverage)

    // 🌟 BƯỚC 4: LƯU VÀO DB
    await this.speakingSessionRepository.updateById(speakingSessionId, {
      result: {
        overall: overallBand,
        fluency: this._roundToHalf(sessionCriteriaScores.fluency),
        pronunciation: this._roundToHalf(sessionCriteriaScores.pronunciation),
        lexical: this._roundToHalf(sessionCriteriaScores.lexical),
        grammar: this._roundToHalf(sessionCriteriaScores.grammar)
      },
      status: 2,
      finishedAt: new Date()
    })

    console.log(
      `✅ Session ${speakingSessionId} hoàn tất. Điểm Overall: ${overallBand} | FC: ${sessionCriteriaScores.fluency.toFixed(1)}, PR: ${sessionCriteriaScores.pronunciation.toFixed(1)}, LR: ${sessionCriteriaScores.lexical.toFixed(1)}, GRA: ${sessionCriteriaScores.grammar.toFixed(1)}`
    )

    // 🚀 TẠI ĐÂY: Nếu bạn có dùng Socket/SSE, hãy gọi hàm push thông báo cho FE
  }

  // Thuật toán làm tròn cực chuẩn của IELTS
  private _roundToHalf(value: number): number {
    return Math.round(value * 2) / 2
  }
}
