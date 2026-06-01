import { BaseMapper } from '~/common/base'
import { AttemptAnalysisType, AttemptType } from './attempt.model'
import {
  AttemptDetailResponseDto,
  AttemptLeaderboardDto,
  AttemptResponseDto,
  AttemptWordAssessmentDto
} from './attempt.dto'
import { singleton } from 'tsyringe'

@singleton()
export class AttemptMapper extends BaseMapper<AttemptType, AttemptResponseDto> {
  toResponse(entity: AttemptType): AttemptResponseDto {
    const hasData = (obj: any) => obj && Object.keys(obj).length > 0
    return {
      id: entity._id.toString(),
      speakingSessionId: entity?.speakingSessionId ? entity.speakingSessionId.toString() : undefined,
      mode: entity.mode,
      forecastQuestionId: entity.forecastQuestionId.toString(),
      audioUrl: entity.audioFileId ? ((entity.audioFileId as any).url ?? undefined) : undefined,
      duration: entity.audioFileId ? ((entity.audioFileId as any).duration ?? undefined) : undefined,
      part: entity.part,
      order: entity.order,
      status: entity.status,
      isPublic: entity.isPublic,
      analysisProfile: entity.analysisProfile,
      analysisVersion: entity.analysisVersion,
      transcriptPreview: entity.transcriptPreview ?? undefined,
      scores: hasData(entity.scores) ? entity.scores : undefined,
      analysisMeta: hasData(entity.analysisMeta) ? entity.analysisMeta : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
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
      'fillerCount',
      'fillers',
      'repetitionCount',
      'repetitions'
    ])

    return {
      ...summary,
      transcript: analysis?.transcription?.scoringTranscript ?? entity.transcriptPreview ?? undefined,
      evaluation: this._hasData(analysis?.evaluation) ? analysis?.evaluation : undefined,
      fluencyMetrics,
      pronunciationScores: this._hasData(analysis?.pronunciationAssessment?.scores)
        ? analysis?.pronunciationAssessment?.scores
        : undefined,
      wordAssessments: this._mapWordAssessments(analysis)
    }
  }

  toLeaderboardResponse(entity: AttemptType): AttemptLeaderboardDto {
    const userInfo =
      entity.userId && typeof entity.userId !== 'string'
        ? {
            id: (entity.userId as any)._id.toString(),
            fullName: (entity.userId as any).fullName || 'Anonymous',
            avatar: (entity.userId as any).avatar
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

    return words.map((word) => ({
      wordIndex: word.wordIndex,
      word: word.word,
      accuracyScore: word.accuracyScore,
      errorType: word.errorType,
      startTime: word.offset,
      endTime:
        typeof word.offset === 'number' && typeof word.duration === 'number' ? word.offset + word.duration : undefined,
      punctuationAfter: word.punctuationAfter,
      expectedIpa: word.expectedIpa,
      spokenIpa: word.spokenIpa
    }))
  }

  private _pickRecord(
    record: Record<string, unknown> | undefined,
    keys: string[]
  ): Record<string, unknown> | undefined {
    if (!record) return undefined

    const picked = keys.reduce<Record<string, unknown>>((acc, key) => {
      if (record[key] !== undefined) acc[key] = record[key]
      return acc
    }, {})

    return this._hasData(picked) ? picked : undefined
  }

  private _hasData(obj: unknown): boolean {
    return !!obj && typeof obj === 'object' && Object.keys(obj).length > 0
  }
}
