import { BaseMapper } from '~/common/base'
import { AttemptAnalysisType, AttemptType } from './attempt.model'
import { AttemptLeaderboardDto, AttemptResponseDto } from './attempt.dto'
import { singleton } from 'tsyringe'

@singleton()
export class AttemptMapper extends BaseMapper<AttemptType, AttemptResponseDto> {
  toResponse(entity: AttemptType, analysis?: AttemptAnalysisType | null): AttemptResponseDto {
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
      providers: hasData(analysis?.providers) ? analysis?.providers : undefined,
      transcription: hasData(analysis?.transcription) ? analysis?.transcription : undefined,
      pronunciationAssessment: hasData(analysis?.pronunciationAssessment)
        ? analysis?.pronunciationAssessment
        : undefined,
      speechAnalysis: hasData(analysis?.speechAnalysis) ? analysis?.speechAnalysis : undefined,
      evaluation: hasData(analysis?.evaluation) ? analysis?.evaluation : undefined,
      analysisMeta: hasData(entity.analysisMeta) ? entity.analysisMeta : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
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
}
