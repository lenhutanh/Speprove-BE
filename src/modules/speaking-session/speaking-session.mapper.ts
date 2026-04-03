import { BaseMapper } from '~/common/base'
import { SpeakingSessionType } from './speaking-session.model'
import { SpeakingSessionResponseSto } from './speaking-session.dto'
import { singleton } from 'tsyringe'

@singleton()
export class SpeakingSessionMapper extends BaseMapper<SpeakingSessionType, SpeakingSessionResponseSto> {
  toResponse(entity: SpeakingSessionType): SpeakingSessionResponseSto {
    return {
      id: entity._id.toString(),
      userId: entity.userId.toString(),
      forecastId: entity.forecastId.toString(),
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
      finishedAt: entity.finishedAt ?? undefined
    }
  }
}
