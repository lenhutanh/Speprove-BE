import { BaseRepository } from '~/core/persistence/base.repository'
import { SpeakingSession, SpeakingSessionType } from './speaking-session.model'
import { ISpeakingSessionRepository } from './speaking-session.repository.interface'
import { singleton } from 'tsyringe'

@singleton()
export class SpeakingSessionRepository
  extends BaseRepository<SpeakingSessionType>
  implements ISpeakingSessionRepository
{
  constructor() {
    super(SpeakingSession)
  }
}
