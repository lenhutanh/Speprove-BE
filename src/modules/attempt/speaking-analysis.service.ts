import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ATTEMPT_STATUS, PartKind, SPEAKING_SESSION_MODE } from '~/common/constants/constants'
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
    private readonly llmEvaluator: LLMEvaluator
  ) {}

  // Job 1: Transcribe
  public async transcribe(data: TranscribeJobData): Promise<void> {
    const { attemptId, audioUrl, questionContent, part } = data
    console.log('🚀 ~ SpeakingAnalysisService ~ transcribe ~ data:', data)
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

    // if (updatedAttempt.mode === SPEAKING_SESSION_MODE.MOCK && updatedAttempt.speakingSessionId) {
    //   const sessionId = updatedAttempt.speakingSessionId.toString();
    //   const session = await this.speakingSessionRepository.findById(sessionId);
    //   const totalQuestions = [...(session.questions.part1 || []), ...].length;
    //   const doneCount = await this.redisClient.incr(`session:${sessionId}:done_count`);
    //   console.log(`[Session ${sessionId}] Progress: ${doneCount} / ${totalQuestions}`);
    //   if (doneCount === totalQuestions) {
    //     console.log(`🎉 Kích hoạt tính điểm cho Session: ${sessionId}`);
    //     await this.speakingProducer.scoreSession({ speakingSessionId: sessionId });
    //     await this.redisClient.del(`session:${sessionId}:done_count`);
    //   }
    // }
  }

  // ─── Job 4: Tổng hợp điểm session (mock only) ───────────────────────────────
  // async scoreSession(data: ScoreSessionJobData): Promise<void> {
  //   const { speakingSessionId } = data

  //   const attempts = await this.attemptRepository.findBySessionId(speakingSessionId)

  //   // Chờ tất cả attempts done
  //   const allDone = attempts.every((a) => a.status === ATTEMPT_STATUS.DONE)
  //   if (!allDone) return

  //   // Tổng hợp band score từ tất cả attempts
  //   const bandsPerAttempt = attempts.map((a) => a.evaluation?.overall).filter((b): b is number => b != null)

  //   if (bandsPerAttempt.length === 0) return

  //   const overallBand = this._roundToHalf(bandsPerAttempt.reduce((sum, b) => sum + b, 0) / bandsPerAttempt.length)

  //   await this.speakingSessionRepository.updateById(speakingSessionId, {
  //     result: { band: overallBand },
  //     status: 2 // DONE
  //   })
  // }
  // private _roundToHalf(value: number): number {
  //   return Math.round(value * 2) / 2
  // }
}
