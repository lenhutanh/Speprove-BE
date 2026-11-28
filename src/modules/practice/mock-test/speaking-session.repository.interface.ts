import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { SpeakingSessionType } from './speaking-session.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISpeakingSessionRepository extends IBaseRepository<SpeakingSessionType> {}
