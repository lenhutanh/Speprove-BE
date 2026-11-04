import { BaseRepository } from '~/common/base/base.repository'
import { VoiceRoom, VoiceRoomType } from '../voice-room.model'
import { IVoiceRoomRepository } from './voice-room.repository.interface'

export class VoiceRoomRepository extends BaseRepository<VoiceRoomType> implements IVoiceRoomRepository {
  constructor() {
    super(VoiceRoom)
  }
}
