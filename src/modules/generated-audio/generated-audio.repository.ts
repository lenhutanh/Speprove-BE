import { BaseRepository } from '~/common/base/base.repository'
import { GeneratedAudio, GeneratedAudioType } from './generated-audio.model'
import { IGeneratedAudioRepository } from './generated-audio.repository.interface'

export class GeneratedAudioRepository extends BaseRepository<GeneratedAudioType> implements IGeneratedAudioRepository {
  constructor() {
    super(GeneratedAudio)
  }
}
