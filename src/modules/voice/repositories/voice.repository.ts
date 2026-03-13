import { BaseRepository } from '~/common/base/base.repository'
import { Voice, VoiceType } from '../voice.model'
import { IVoiceRepository } from './voice.repository.interface'

export class VoiceRepository extends BaseRepository<VoiceType> implements IVoiceRepository {
  constructor() {
    super(Voice)
  }
}
