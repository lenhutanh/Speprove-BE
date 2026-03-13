import { StatusCodes } from 'http-status-codes'
import { AUDIO_MIME_TYPES, CLOUD_FOLDERS, STATUS } from '~/common/constants/constants'
import { VoiceType } from './voice.model'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IVoiceRepository } from './repositories/voice.repository.interface'
import { QueryBuilder } from '~/common/base/query-builder'
import { CreateVoiceBodyType, UpdateVoiceBodyType } from './types/voice.type'
import { AppError } from '~/common/errors'
import { getVoiceSampleText } from '~/common/utils'
import { AzureSpeechProvider } from '~/infrastructure/providers/ai/azure/azure-speech.provider'
import { CloudinaryStorageProvider } from '~/infrastructure/providers/storage/cloudinary-storage.provider'
import { FileService } from '../file/file.service'

@singleton()
export class VoiceService {
  constructor(
    private readonly fileService: FileService,
    @inject(TOKENS.IVoiceRepository) private readonly voiceRepository: IVoiceRepository
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

  public async getList(query?: any) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = query || {}
    const qb = new QueryBuilder<VoiceType>()
    const { filter, options } = qb
      .applyFilters(filters, ['gender', 'locale', 'status', 'createdAt'])
      .search(['name'], search)
      .sort(sortBy, sortOrder)
      .build()
    return await this.voiceRepository.paginate(filter, page, limit, options)
  }

  public async activate(id: string) {
    const voice = await this.voiceRepository.findById(id)

    if (!voice) {
      throw new AppError('Voice not found', StatusCodes.NOT_FOUND)
    }

    if (voice.status !== STATUS.PENDING) {
      throw new AppError('Cannot activate', StatusCodes.FORBIDDEN)
    }

    const text = getVoiceSampleText()

    const audioFile = await this.fileService.generateAndSaveAudio({
      text,
      voiceCode: voice.voiceCode,
      speed: voice.speed,
      pitch: voice.pitch,
      folder: CLOUD_FOLDERS.VOICE_SAMPLES
    })

    return this.voiceRepository.updateById(id, {
      sampleAudioFileId: audioFile._id,
      status: STATUS.ACTIVE
    })
  }
}
