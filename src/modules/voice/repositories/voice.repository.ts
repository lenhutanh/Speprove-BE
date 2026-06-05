import { BaseRepository } from '~/common/base/base.repository'
import { Voice, VoiceType } from '../voice.model'
import { IVoiceRepository } from './voice.repository.interface'
import { STATUS } from '~/common/constants/status.constants'

export class VoiceRepository extends BaseRepository<VoiceType> implements IVoiceRepository {
  constructor() {
    super(Voice)
  }

  public async getRandom(): Promise<VoiceType | null> {
    const result = await this.aggregate([{ $match: { status: STATUS.ACTIVE } }, { $sample: { size: 1 } }])
    return result.length > 0 ? result[0] : null
  }
}
