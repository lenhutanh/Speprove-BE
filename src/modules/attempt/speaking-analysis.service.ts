import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ATTEMPT_STATUS } from './attempt.constants'
import { PART_KIND } from '../question/question.constants'
import { SESSION_STATUS, SPEAKING_SESSION_MODE } from '../speaking-session/speaking-session.constants'
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
import { IAttemptAnalysisRepository } from './attempt-analysis.repository.interface'
import { ISpeakingSessionRepository } from '../speaking-session/speaking-session.repository.interface'
import { ISTTProvider } from '~/infrastructure/providers/stt'
import { toObjectId } from '~/common/utils'
import { LLMEvaluator } from '~/infrastructure/providers/evaluator/llm-evaluator'
import { SpeakingSessionService } from '../speaking-session/speaking-session.service'
import { normalizeForAssessment } from './speaking-analysis.util'

type AnalysisStage = 'transcribe' | 'assess' | 'evaluate' | 'score_session'

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
    @inject(TOKENS.IAttemptAnalysisRepository)
    private readonly attemptAnalysisRepository: IAttemptAnalysisRepository,
    @inject(TOKENS.ISpeakingSessionRepository)
    private readonly speakingSessionRepository: ISpeakingSessionRepository,
    private readonly speakingSessionService: SpeakingSessionService,
    private readonly llmEvaluator: LLMEvaluator
  ) {}

  public async transcribe(data: TranscribeJobData): Promise<void> {
    const { attemptId, audioUrl, questionContent, part } = data

    await this.attemptRepository.updateById(attemptId, {
      $set: {
        status: ATTEMPT_STATUS.PROCESSING,
        'analysisMeta.startedAt': new Date(),
        'analysisMeta.currentStage': 'transcribe'
      },
      $unset: {
        'analysisMeta.error': 1,
        'analysisMeta.failedStage': 1
      }
    })

    try {
      const sttResult = await this.sttProvider.transcribe(audioUrl, questionContent)
      const { transcript } = sttResult
      const displayTranscript = transcript.trim()
      const normalizedReferenceText = normalizeForAssessment(transcript)

      await this.attemptRepository.updateById(attemptId, {
        transcriptPreview: displayTranscript,
        duration: sttResult.duration
      })

      await this.attemptAnalysisRepository.updateOne(
        { attemptId: toObjectId(attemptId) },
        {
          $set: {
            attemptId: toObjectId(attemptId),
            'transcription.sttTranscript': transcript,
            'transcription.normalizedReferenceText': normalizedReferenceText,
            'transcription.confidence': sttResult.confidence,
            'transcription.segments': sttResult.segments ?? [],
            'transcription.metadata': {
              ...(sttResult.metadata ?? {}),
              duration: sttResult.duration
            },
            'providers.stt': sttResult.provider ?? {
              name: 'unknown',
              model: 'unknown'
            }
          }
        },
        { upsert: true }
      )

      console.log('Finish transcribing at: ', Date.now())

      await this.speakingProducer.assess({
        attemptId,
        transcript: normalizedReferenceText,
        referenceTranscript: transcript,
        audioUrl,
        questionContent,
        part
      })
    } catch (error) {
      await this._markAttemptFailed(attemptId, 'transcribe', error)
      throw error
    }
  }

  public async assess(data: AssessJobData): Promise<void> {
    const { attemptId, transcript, referenceTranscript, audioUrl, questionContent, part } = data

    await this.attemptRepository.updateById(attemptId, {
      $set: {
        'analysisMeta.currentStage': 'assess'
      }
    })

    try {
      const result = await this.assessmentProvider.assess(audioUrl, transcript)
      const speechAnalysis = this.speechMapper.toSpeechAnalysis(result, transcript, questionContent, part)
      const display = this.speechMapper.buildDisplayTranscript(result.words, referenceTranscript ?? result.transcript)
      const displayTranscript = display.transcript || referenceTranscript?.trim() || result.transcript
      const scoringTranscript = this.speechMapper.buildScoringTranscript(display.words) || displayTranscript

      await this.attemptRepository.updateById(attemptId, {
        transcriptPreview: displayTranscript,
        'analysisMeta.currentStage': 'assess'
      })

      await this.attemptAnalysisRepository.updateOne(
        { attemptId: toObjectId(attemptId) },
        {
          $set: {
            attemptId: toObjectId(attemptId),
            'transcription.azureTranscript': result.transcript,
            'transcription.scoringTranscript': scoringTranscript,
            'providers.pronunciation': {
              name: 'azure',
              model: 'speech-pronunciation-assessment',
              configVersion: 'ipa-nbest-v1'
            },
            pronunciationAssessment: {
              scores: {
                pronScore: result.pronunciationScore,
                accuracyScore: result.accuracyScore,
                fluencyScore: result.fluencyScore,
                completenessScore: result.completenessScore,
                prosodyScore: result.prosody?.score
              },
              words: display.words,
              prosodyFeedback: result.prosody?.feedback,
              raw: result.raw
            },
            speechAnalysis
          }
        },
        { upsert: true }
      )

      console.log('Finishing assessing at: ', Date.now())

      await this.speakingProducer.evaluate({
        attemptId,
        transcript: scoringTranscript,
        questionContent,
        speechAnalysis,
        part
      })
    } catch (error) {
      await this._markAttemptFailed(attemptId, 'assess', error)
      throw error
    }
  }

  async evaluate(data: EvaluateJobData): Promise<void> {
    const { attemptId, questionContent, speechAnalysis, transcript, part } = data

    await this.attemptRepository.updateById(attemptId, {
      $set: {
        'analysisMeta.currentStage': 'evaluate'
      }
    })

    try {
      const analysis = await this.attemptAnalysisRepository.findOne(
        { attemptId: toObjectId(attemptId) },
        { select: 'transcription.scoringTranscript pronunciationAssessment.words' }
      )
      const scoringTranscript = analysis?.transcription?.scoringTranscript || transcript

      const { evaluation, warnings, isValid } = await this.llmEvaluator.evaluate({
        question: questionContent,
        speechAnalysis,
        assessmentWords: analysis?.pronunciationAssessment?.words,
        transcript: scoringTranscript,
        part
      })

      if (!isValid) {
        await this.attemptAnalysisRepository.updateOne(
          { attemptId: toObjectId(attemptId) },
          {
            $set: {
              attemptId: toObjectId(attemptId),
              evaluation
            }
          },
          { upsert: true }
        )

        await this.attemptRepository.updateById(attemptId, {
          $set: {
            'analysisMeta.finishedAt': new Date(),
            'analysisMeta.currentStage': 'evaluate',
            'analysisMeta.failedStage': 'evaluate',
            'analysisMeta.error': 'LLM evaluator output failed backend validation',
            'analysisMeta.warnings': warnings,
            status: ATTEMPT_STATUS.FAILED
          }
        })

        const validationError = new Error(`LLM evaluator output failed backend validation for attempt ${attemptId}`)
        validationError.name = 'EvaluatorValidationError'
        throw validationError
      }

      await this.attemptAnalysisRepository.updateOne(
        { attemptId: toObjectId(attemptId) },
        {
          $set: {
            attemptId: toObjectId(attemptId),
            evaluation,
            'providers.evaluator': {
              name: 'groq',
              model: 'openai/gpt-oss-120b',
              promptVersion: 'speaking-evaluation-v3'
            }
          }
        },
        { upsert: true }
      )

      const updatedAttempt = await this.attemptRepository.updateById(attemptId, {
        $set: {
          scores: {
            overall: evaluation.overall ?? null,
            fluency: evaluation.fluency?.band ?? null,
            pronunciation: evaluation.pronunciation?.band ?? null,
            lexical: evaluation.lexical?.band ?? null,
            grammar: evaluation.grammar?.band ?? null
          },
          'analysisMeta.finishedAt': new Date(),
          'analysisMeta.warnings': warnings,
          status: ATTEMPT_STATUS.DONE
        },
        $unset: {
          'analysisMeta.error': 1,
          'analysisMeta.failedStage': 1,
          'analysisMeta.currentStage': 1
        }
      })

      if (!updatedAttempt) throw new Error(`Attempt not found: ${attemptId}`)

      console.log(`Finish evaluating attempt ${attemptId} at: `, Date.now())

      try {
        await this.speakingProducer.extractVocabulary({ attemptId })
      } catch (error) {
        console.warn(`Skip enqueueing vocabulary extraction for attempt ${attemptId}: ${this._formatError(error)}`)
      }

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
          console.log(`Activate session score aggregation for session: ${sessionId}`)
          await this.speakingProducer.scoreSession({ speakingSessionId: sessionId })
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'EvaluatorValidationError')) {
        await this._markAttemptFailed(attemptId, 'evaluate', error)
      }
      throw error
    }
  }

  async scoreSession(data: ScoreSessionJobData): Promise<void> {
    const { speakingSessionId } = data
    const attempts = await this.attemptRepository.findMany({ speakingSessionId })

    const allDone = attempts.every((a) => a.status === ATTEMPT_STATUS.DONE)
    if (!allDone || attempts.length === 0) {
      console.warn(`[Job 4] Session ${speakingSessionId} is not complete or has no attempts. Skip.`)
      return
    }

    const getCriteriaAvg = (atts: typeof attempts, key: 'fluency' | 'pronunciation' | 'lexical' | 'grammar') => {
      const validScores = atts.map((a) => a.scores?.[key]).filter((b): b is number => b != null)
      return validScores.length > 0 ? validScores.reduce((sum, b) => sum + b, 0) / validScores.length : null
    }

    const p1Attempts = attempts.filter((a) => a.part === PART_KIND.ONE)
    const p2Attempts = attempts.filter((a) => a.part === PART_KIND.TWO)
    const p3Attempts = attempts.filter((a) => a.part === PART_KIND.THREE)

    const criteriaKeys = ['fluency', 'pronunciation', 'lexical', 'grammar'] as const
    const sessionCriteriaScores: Record<string, number> = {}

    for (const key of criteriaKeys) {
      const p1Score = getCriteriaAvg(p1Attempts, key)
      const p2Score = getCriteriaAvg(p2Attempts, key)
      const p3Score = getCriteriaAvg(p3Attempts, key)

      const validPartScores = [p1Score, p2Score, p3Score].filter((s): s is number => s !== null)
      sessionCriteriaScores[key] =
        validPartScores.length > 0 ? validPartScores.reduce((sum, s) => sum + s, 0) / validPartScores.length : 0
    }

    const sumOfCriteria = Object.values(sessionCriteriaScores).reduce((sum, score) => sum + score, 0)
    const finalAverage = sumOfCriteria / 4
    const overallBand = this._roundToHalf(finalAverage)

    await this.speakingSessionRepository.updateById(speakingSessionId, {
      result: {
        overall: overallBand,
        fluency: this._roundToHalf(sessionCriteriaScores.fluency),
        pronunciation: this._roundToHalf(sessionCriteriaScores.pronunciation),
        lexical: this._roundToHalf(sessionCriteriaScores.lexical),
        grammar: this._roundToHalf(sessionCriteriaScores.grammar)
      },
      status: SESSION_STATUS.COMPLETED,
      finishedAt: new Date()
    })

    console.log(
      `Session ${speakingSessionId} completed. Overall: ${overallBand} | FC: ${sessionCriteriaScores.fluency.toFixed(1)}, PR: ${sessionCriteriaScores.pronunciation.toFixed(1)}, LR: ${sessionCriteriaScores.lexical.toFixed(1)}, GRA: ${sessionCriteriaScores.grammar.toFixed(1)}`
    )
  }

  private _roundToHalf(value: number): number {
    return Math.round(value * 2) / 2
  }

  private async _markAttemptFailed(attemptId: string, stage: AnalysisStage, error: unknown): Promise<void> {
    await this.attemptRepository.updateById(attemptId, {
      $set: {
        status: ATTEMPT_STATUS.FAILED,
        'analysisMeta.finishedAt': new Date(),
        'analysisMeta.currentStage': stage,
        'analysisMeta.failedStage': stage,
        'analysisMeta.error': this._formatError(error)
      }
    })
  }

  private _formatError(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'Unknown speaking analysis error'
  }
}
