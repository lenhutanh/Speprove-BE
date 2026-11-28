import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { VoiceRoomType } from './voice-room.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IVoiceRoomRepository extends IBaseRepository<VoiceRoomType> {}
