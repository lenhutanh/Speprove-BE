import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IInstructionAudioRepository } from './instruction-audio.repository.interface'
import { FileService } from '../file/file.service'
import { STATUS } from '~/common/constants/status.constants'
import { InstructionKey } from './instruction-audio.constants'

@singleton()
export class InstructionAudioService {
  constructor(
    @inject(TOKENS.IInstructionAudioRepository)
    private readonly instructionAudioRepository: IInstructionAudioRepository,
    private readonly fileService: FileService
  ) {}

  public async getUrlByVoiceIdAndKey(voiceId: string, key: InstructionKey): Promise<string | null> {
    const result = await this.instructionAudioRepository.findOne(
      {
        voiceId,
        key
      },
      {
        populate: 'audioFileId'
      }
    )

    if (!result || !result.audioFileId) {
      return null
    }

    return (result.audioFileId as any).url || null
  }

  public async generate(data: any) {
    const existing = await this.instructionAudioRepository.findOne({
      voiceId: data.voiceId,
      key: data.key
    })

    if (existing) {
      return existing
    }

    const file = await this.fileService.generateAndSaveAudio({
      text: data.text,
      voiceCode: data.voiceCode,
      speed: data.speed,
      pitch: data.pitch,
      folder: data.folder
    })

    return await this.instructionAudioRepository.create({
      voiceId: data.voiceId,
      key: data.key,
      audioFileId: file._id,
      status: STATUS.ACTIVE
    })
  }
}
