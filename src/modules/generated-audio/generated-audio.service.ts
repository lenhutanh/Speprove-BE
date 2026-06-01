import crypto from 'crypto'
import { inject, singleton } from 'tsyringe'
import { CLOUD_FOLDERS, STATUS } from '~/common/constants/constants'
import { TOKENS } from '~/common/constants/tokens'
import { toObjectId } from '~/common/utils'
import { FileService } from '../file/file.service'
import { VoiceService } from '../voice/voice.service'
import { GeneratedAudioType, GeneratedAudioWithFile } from './generated-audio.model'
import { IGeneratedAudioRepository } from './generated-audio.repository.interface'
import { GeneratedAudioResult } from './generated-audio.type'

@singleton()
export class GeneratedAudioService {
  constructor(
    @inject(TOKENS.IGeneratedAudioRepository)
    private readonly generatedAudioRepository: IGeneratedAudioRepository,
    private readonly fileService: FileService,
    private readonly voiceService: VoiceService
  ) {}

  public async getOrCreate(data: { text: string; voiceId: string }): Promise<GeneratedAudioResult> {
    const normalizedText = this._normalizeText(data.text)
    const cacheKey = this._cacheKey(normalizedText, data.voiceId)

    const existing = await this.generatedAudioRepository.findOne(
      { cacheKey, status: STATUS.ACTIVE },
      { populate: { path: 'fileId' } }
    )

    if (existing) {
      await this.generatedAudioRepository.updateById(existing._id, {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() }
      })

      return this._toResult(existing, true)
    }

    const voice = await this.voiceService.findActiveById(data.voiceId)
    const file = await this.fileService.generateAndSaveAudio({
      text: data.text,
      voiceCode: voice.voiceCode,
      speed: voice.speed,
      pitch: voice.pitch ?? 0,
      folder: CLOUD_FOLDERS.GENERATED_AUDIOS
    })

    const created = await this.generatedAudioRepository.create({
      text: data.text,
      normalizedText,
      voiceId: toObjectId(data.voiceId),
      fileId: file._id,
      cacheKey,
      usageCount: 1,
      lastUsedAt: new Date(),
      status: STATUS.ACTIVE
    })

    return this._toResult({ ...created, fileId: file }, false)
  }

  public buildCacheKey(data: { text: string; voiceId: string }): string {
    return this._cacheKey(this._normalizeText(data.text), data.voiceId)
  }

  public normalizeText(text: string): string {
    return this._normalizeText(text)
  }

  private _toResult(
    generatedAudio: GeneratedAudioType | GeneratedAudioWithFile,
    cached: boolean
  ): GeneratedAudioResult {
    const file = generatedAudio.fileId as any

    return {
      id: generatedAudio._id.toString(),
      fileId: file?._id?.toString?.() ?? generatedAudio.fileId.toString(),
      audioUrl: file?.url ?? '',
      text: generatedAudio.text,
      normalizedText: generatedAudio.normalizedText,
      voiceId: generatedAudio.voiceId.toString(),
      cacheKey: generatedAudio.cacheKey,
      cached
    }
  }

  private _cacheKey(normalizedText: string, voiceId: string): string {
    return crypto.createHash('sha256').update(`${normalizedText}|${voiceId}`).digest('hex')
  }

  private _normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ').toLowerCase()
  }
}
