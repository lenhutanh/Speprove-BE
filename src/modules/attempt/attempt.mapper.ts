import { BaseMapper } from '~/common/base'
import { AttemptType } from './attempt.model'
import { AttemptLeaderboardDto, AttemptResponseDto } from './attempt.dto'
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
      speechMetrics: hasData(entity.speechMetrics) ? entity.speechMetrics : undefined,
      evaluation: hasData(entity.evaluation) ? entity.evaluation : undefined,
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
      transcript: entity.evaluation?.transcript,
      scores: {
        overall: entity.evaluation?.overall ?? null,
        fluency: entity.evaluation?.fluency?.band ?? null,
        pronunciation: entity.evaluation?.pronunciation?.band ?? null,
        lexical: entity.evaluation?.lexical?.band ?? null,
        grammar: entity.evaluation?.grammar?.band ?? null
      },
      user: userInfo,
      createdAt: entity.createdAt
    }
  }

  toLeaderboardResponseList(entities: AttemptType[]): AttemptLeaderboardDto[] {
    return entities.map((entity) => this.toLeaderboardResponse(entity))
  }
}
