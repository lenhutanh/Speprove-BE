import { BaseMapper } from '~/common/base'
import { AssessmentIssue, AttemptAnalysisType, AttemptType, Evaluation, FluencyMetrics } from './attempt.model'
import {
  AttemptDetailResponseDto,
  AttemptLeaderboardDto,
  AttemptResponseDto,
  AttemptWordAssessmentDto
} from './attempt.dto'
import { singleton } from 'tsyringe'
import { ForecastQuestionMapper } from '../forecast-question/forecast-question.mapper'

@singleton()
export class AttemptMapper extends BaseMapper<AttemptType, AttemptResponseDto> {
  constructor(private readonly forecastQuestionMapper: ForecastQuestionMapper) {
    super()
  }

  toResponse(entity: AttemptType): AttemptResponseDto {
    const hasData = (obj: any) => obj && Object.keys(obj).length > 0
    const forecastQuestionIdStr = entity.forecastQuestionId?._id
      ? entity.forecastQuestionId._id.toString()
      : entity.forecastQuestionId?.toString()

    const res: AttemptResponseDto = {
      id: entity._id.toString(),
      speakingSessionId: entity?.speakingSessionId ? entity.speakingSessionId.toString() : undefined,
      mode: entity.mode,
      forecastQuestionId: forecastQuestionIdStr,
      audioUrl: entity.audioFileId ? ((entity.audioFileId as any).url ?? undefined) : undefined,
      duration: entity.audioFileId ? ((entity.audioFileId as any).duration ?? undefined) : undefined,
      part: entity.part,
      order: entity.order,
      status: entity.status,
      isPublic: entity.isPublic,
      retryCount: entity.retryCount ?? undefined,
      refundedAt: entity.refundedAt ?? undefined,
      analysisProfile: entity.analysisProfile,
      analysisVersion: entity.analysisVersion,
      transcriptPreview: entity.transcriptPreview ?? undefined,
      scores: hasData(entity.scores) ? entity.scores : undefined,
      analysisMeta: hasData(entity.analysisMeta) ? entity.analysisMeta : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    if (
      entity.forecastQuestionId &&
      typeof entity.forecastQuestionId === 'object' &&
      '_id' in entity.forecastQuestionId
    ) {
      res.question = this.forecastQuestionMapper.toResponse(entity.forecastQuestionId)
    }

    return res
  }

  toDetailResponse(entity: AttemptType, analysis?: AttemptAnalysisType | null): AttemptDetailResponseDto {
    const summary = this.toResponse(entity)
    const fluencyMetrics = this._pickRecord(analysis?.speechAnalysis?.fluencyMetrics, [
      'speechDuration',
      'wordCount',
      'speechRate',
      'articulationRate',
      'pauseCount',
      'longPauseCount',
      'totalPauseDuration',
      'pauseRatio',
      'meanLengthOfRun',
      'pauses'
    ]) as Partial<FluencyMetrics> | undefined

    return {
      ...summary,
      transcript: analysis?.transcription?.scoringTranscript ?? entity.transcriptPreview ?? undefined,
      evaluation: this._normalizeEvaluation(analysis?.evaluation),
      fluencyMetrics,
      pronunciationScores: this._hasData(analysis?.pronunciationAssessment?.scores)
        ? analysis?.pronunciationAssessment?.scores
        : undefined,
      wordAssessments: this._mapWordAssessments(analysis)
    }
  }

  toLeaderboardResponse(entity: AttemptType): AttemptLeaderboardDto {
    const avatarUrl =
      entity.userId && typeof entity.userId !== 'string' && (entity.userId as any).avatarId
        ? typeof (entity.userId as any).avatarId === 'object' && 'url' in (entity.userId as any).avatarId
          ? (entity.userId as any).avatarId.url
          : undefined
        : undefined

    const userInfo =
      entity.userId && typeof entity.userId !== 'string'
        ? {
            id: (entity.userId as any)._id.toString(),
            fullName: (entity.userId as any).fullName || 'Anonymous',
            avatar: avatarUrl
          }
        : null

    return {
      id: entity._id.toString(),
      audioUrl: entity.audioFileId ? ((entity.audioFileId as any).url ?? undefined) : undefined,
      duration: entity.audioFileId ? ((entity.audioFileId as any).duration ?? undefined) : undefined,
      transcript: entity.transcriptPreview ?? undefined,
      scores: {
        overall: entity.scores?.overall ?? null,
        fluency: entity.scores?.fluency ?? null,
        pronunciation: entity.scores?.pronunciation ?? null,
        lexical: entity.scores?.lexical ?? null,
        grammar: entity.scores?.grammar ?? null
      },
      user: userInfo,
      createdAt: entity.createdAt
    }
  }

  toLeaderboardResponseList(entities: AttemptType[]): AttemptLeaderboardDto[] {
    return entities.map((entity) => this.toLeaderboardResponse(entity))
  }

  private _mapWordAssessments(analysis?: AttemptAnalysisType | null): AttemptWordAssessmentDto[] | undefined {
    const words = analysis?.pronunciationAssessment?.words
    if (!Array.isArray(words) || words.length === 0) return undefined

    return words.map((word) => {
      const phonemes = Array.isArray(word.phonemes)
        ? word.phonemes.map((phoneme) => ({
            phoneme: phoneme.phoneme,
            expectedIpa: phoneme.expectedIpa,
            spokenIpa: phoneme.spokenIpa,
            accuracyScore: phoneme.accuracyScore
          }))
        : []

      return {
        wordIndex: word.wordIndex,
        word: word.word,
        accuracyScore: word.accuracyScore,
        errorType: word.errorType,
        startTime: word.offset,
        endTime:
          typeof word.offset === 'number' && typeof word.duration === 'number'
            ? word.offset + word.duration
            : undefined,
        punctuationAfter: word.punctuationAfter,
        expectedIpa: word.expectedIpa,
        spokenIpa: word.spokenIpa,
        phonemes: phonemes.length ? phonemes : undefined
      }
    })
  }

  private _pickRecord(record: object | undefined, keys: string[]): Record<string, unknown> | undefined {
    if (!record) return undefined

    const source = record as Record<string, unknown>
    const picked = keys.reduce<Record<string, unknown>>((acc, key) => {
      if (source[key] !== undefined) acc[key] = source[key]
      return acc
    }, {})

    return this._hasData(picked) ? picked : undefined
  }

  private _hasData(obj: unknown): boolean {
    return !!obj && typeof obj === 'object' && Object.keys(obj).length > 0
  }

  private _normalizeEvaluation(evaluation?: Partial<Evaluation>): Partial<Evaluation> | undefined {
    if (!this._hasData(evaluation)) return undefined

    return {
      ...evaluation,
      fluency: evaluation?.fluency,
      lexical: evaluation?.lexical
        ? {
            ...evaluation.lexical,
            issues: this._normalizeIssues(evaluation.lexical.issues)
          }
        : evaluation?.lexical,
      grammar: evaluation?.grammar
        ? {
            ...evaluation.grammar,
            issues: this._normalizeIssues(evaluation.grammar.issues)
          }
        : evaluation?.grammar
    }
  }

  private _normalizeIssues(issues?: AssessmentIssue[]): AssessmentIssue[] {
    if (!Array.isArray(issues)) return []

    return issues.map((issue) => ({
      ...issue,
      severity: this._normalizeSeverity((issue as { severity?: unknown }).severity)
    }))
  }

  private _normalizeSeverity(severity: unknown): 'minor' | 'major' {
    if (severity === 'minor' || severity === 'low') return 'minor'
    return 'major'
  }
}
