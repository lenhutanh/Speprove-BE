import { BaseMapper } from '~/common/base'
import { AttemptType } from './attempt.model'
import { AttemptResponseDto } from './attempt.dto'
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
      speechMetrics: hasData(entity.speechMetrics) ? entity.speechMetrics : undefined,
      evaluation: hasData(entity.evaluation) ? entity.evaluation : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}
