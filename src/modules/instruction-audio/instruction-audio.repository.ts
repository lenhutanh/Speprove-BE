import { BaseRepository } from '~/common/base'
import { InstructionAudio, InstructionAudioType } from './instruction-audio.model'
import { IInstructionAudioRepository } from './instruction-audio.repository.interface'

export class InstructionAudioRepository
  extends BaseRepository<InstructionAudioType>
  implements IInstructionAudioRepository
{
  constructor() {
    super(InstructionAudio)
  }
}
