import { BaseMapper } from '~/common/base'
import { SpeakingSessionType } from './speaking-session.model'
import { SpeakingSessionResponseDto } from './speaking-session.dto'
import { singleton } from 'tsyringe'

@singleton()
export class SpeakingSessionMapper extends BaseMapper<SpeakingSessionType, SpeakingSessionResponseDto> {
  toResponse(entity: SpeakingSessionType): SpeakingSessionResponseDto {
    return {
      id: entity._id.toString(),
      userId: entity.userId.toString(),
      forecastId: entity.forecastId.toString(),
      voiceId: entity.voiceId?.toString(),
      type: entity.type,
      status: entity.status,
      result: entity.result
        ? {
            fluency: entity.result.fluency ?? null,
            lexical: entity.result.lexical ?? null,
            grammar: entity.result.grammar ?? null,
            pronunciation: entity.result.pronunciation ?? null,
            overall: entity.result.overall ?? null
          }
        : undefined,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt ?? undefined,
      refundedAt: entity.refundedAt ?? undefined,
      scoringQueuedAt: entity.scoringQueuedAt ?? undefined,
      retryCount: entity.retryCount ?? undefined
    }
  }
}
