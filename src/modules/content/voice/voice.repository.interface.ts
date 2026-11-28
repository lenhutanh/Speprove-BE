import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { VoiceType } from './voice.model'

export interface IVoiceRepository extends IBaseRepository<VoiceType> {
  getRandom(): Promise<VoiceType | null>
}
