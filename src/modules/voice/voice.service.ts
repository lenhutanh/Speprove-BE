import { StatusCodes } from 'http-status-codes'
import { STATUS } from '~/common/constants/status.constants'
import { CLOUD_FOLDERS } from '~/infrastructure/providers/storage/storage.constants'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IVoiceRepository } from './repositories/voice.repository.interface'
import { CreateVoiceBodyType, UpdateVoiceBodyType } from './types/voice.type'
import { AppError } from '~/common/errors'
import { FileService } from '../file/file.service'
import { VoiceMapper } from './voice.mapper'
import { INSTRUCTION_SCRIPTS } from '../speaking-session/speaking-session.constants'
import { GeneratedAudioService } from '../generated-audio/generated-audio.service'
import { VOICE_SAMPLE_TEXT } from './voice.constants'

@singleton()
export class VoiceService {
  constructor(
    private readonly fileService: FileService,
    @inject(TOKENS.IVoiceRepository) private readonly voiceRepository: IVoiceRepository,
    private readonly voiceMapper: VoiceMapper,
    private readonly generatedAudioService: GeneratedAudioService
  ) {}
  public async createNew(data: CreateVoiceBodyType) {
    const locale = data.voiceCode.split('-').slice(0, 2).join('-')
    return await this.voiceRepository.create({ ...data, locale })
  }

  public async update(id: string, data: UpdateVoiceBodyType) {
    const existingVoice = await this.voiceRepository.findById(id)
    if (!existingVoice) {
      throw new AppError('Voice not found', StatusCodes.NOT_FOUND)
    }

    if (existingVoice.status !== STATUS.PENDING) {
      throw new AppError('Cannot update. Voice is not pending.', StatusCodes.FORBIDDEN)
    }

    const updateData: any = { ...data }

    if (data?.voiceCode) {
      updateData.locale = data.voiceCode.split('-').slice(0, 2).join('-')
    }

    return await this.voiceRepository.updateById(id, updateData)
  }

  public async getAll() {
    return await this.voiceRepository.findMany({ status: STATUS.ACTIVE })
  }

  public async getList() {
    const voices = await this.voiceRepository.findMany({ status: STATUS.ACTIVE }, { populate: 'sampleAudioFileId' })
    return this.voiceMapper.toResponseList(voices)
  }

  public async activate(id: string) {
    const voice = await this.voiceRepository.findById(id)

    if (!voice) {
      throw new AppError('Voice not found', StatusCodes.NOT_FOUND)
    }

    if (voice.status !== STATUS.PENDING) {
      throw new AppError('Cannot activate', StatusCodes.FORBIDDEN)
    }

    const audioFile = await this.fileService.generateAndSaveAudio({
      text: VOICE_SAMPLE_TEXT,
      voiceCode: voice.voiceCode,
      speed: voice.speed,
      pitch: voice.pitch,
      folder: CLOUD_FOLDERS.VOICE_SAMPLES
    })

    // Pre-warm the cache for instruction audios in the background
    Promise.all(
      Object.values(INSTRUCTION_SCRIPTS).map((text) =>
        this.generatedAudioService.getOrCreate({ text, voiceId: voice._id.toString() }).catch((err) => {
          console.error(`Failed to pre-warm audio for text: "${text}"`, err)
        })
      )
    )

    return this.voiceRepository.updateById(id, {
      sampleAudioFileId: audioFile._id,
      status: STATUS.ACTIVE
    })
  }

  public async getDefault() {
    const voice = await this.voiceRepository.findOne(
      { isDefault: true, status: STATUS.ACTIVE },
      {
        populate: 'sampleAudioFileId'
      }
    )
    if (!voice) throw new AppError('Default voice not found', StatusCodes.NOT_FOUND)
    return this.voiceMapper.toResponse(voice)
  }

  public async getRandomVoice() {
    const voice = await this.voiceRepository.getRandom()
    if (!voice) throw new AppError('Not found any voice', StatusCodes.NOT_FOUND)
    return voice
  }

  public async findById(id: string) {
    const voice = await this.voiceRepository.findById(id)
    if (!voice) throw new AppError('Voice not found', StatusCodes.NOT_FOUND)
    return voice
  }

  public async getSampleAudio(id: string) {
    const voice = await this.voiceRepository.findById(id)
    if (!voice) {
      throw new AppError('Voice not found', StatusCodes.NOT_FOUND)
    }

    if (voice.status !== STATUS.ACTIVE) {
      throw new AppError('Voice is not active', StatusCodes.BAD_REQUEST)
    }

    if (voice.sampleAudioFileId) {
      const populatedVoice = await this.voiceRepository.findById(id, { populate: 'sampleAudioFileId' })
      const fileNode = populatedVoice?.sampleAudioFileId as any
      if (fileNode?.url) {
        return { audioUrl: fileNode.url }
      }
    }

    const audioFile = await this.fileService.generateAndSaveAudio({
      text: VOICE_SAMPLE_TEXT,
      voiceCode: voice.voiceCode,
      speed: voice.speed,
      pitch: voice.pitch ?? 0,
      folder: CLOUD_FOLDERS.VOICE_SAMPLES
    })

    await this.voiceRepository.updateById(id, {
      sampleAudioFileId: audioFile._id
    })

    return { audioUrl: audioFile.url }
  }

  public async findActiveById(id: string) {
    const voice = await this.voiceRepository.findOne({ _id: id, status: STATUS.ACTIVE })
    if (!voice) throw new AppError('Active voice not found', StatusCodes.NOT_FOUND)
    return voice
  }
}
