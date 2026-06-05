import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IFileRepository } from './repositories/file.repository.interface'
import { AUDIO_MIME_TYPES, AudioPurpose, FILE_KIND, FileKind, ImagePurpose, PURPOSE_TO_FOLDER } from './file.constants'
import { STORAGE_PROVIDER, UploadPreset } from '~/infrastructure/providers/storage/storage.constants'
import { toObjectId } from '~/common/utils'
import { generateFileName } from './file.util'
import { FileType } from './file.model'
import { CloudinaryStorageProvider } from '~/infrastructure/providers/storage/cloudinary-storage.provider'
import { EdgeTTSProvider } from '~/infrastructure/providers/tts/edge-tts.provider'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { FileMapper } from './file.mapper'
import { SpeechService } from '../speech/speech.service'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

@singleton()
export class FileService {
  constructor(
    @inject(TOKENS.IFileRepository)
    private readonly fileRepository: IFileRepository,
    private readonly edgeTSSProvider: EdgeTTSProvider,
    private readonly cloudinaryStorage: CloudinaryStorageProvider,
    private readonly fileMapper: FileMapper,
    private readonly speechService: SpeechService
  ) {}

  public async uploadFile(userId: string, purpose: string, kind: FileKind, file?: Express.Multer.File) {
    if (!file) throw new AppError(`${kind} file is required.`)

    const folder = PURPOSE_TO_FOLDER[purpose as ImagePurpose | AudioPurpose]

    let finalFileName = generateFileName(file.originalname)

    if (kind === FILE_KIND.IMAGE) {
      const uploadResult = await this.cloudinaryStorage.upload(file.buffer, folder, UploadPreset.IMAGE_DEFAULT)

      const result = await this.fileRepository.create({
        kind,
        storageKey: uploadResult.publicId,
        provider: STORAGE_PROVIDER.CLOUDINARY,
        url: uploadResult.url,
        fileName: finalFileName,
        fileSize: uploadResult.bytes,
        mimeType: file.mimetype,
        ownerId: toObjectId(userId)
      })

      return this.fileMapper.toResponse(result as FileType)
    }

    if (kind === FILE_KIND.AUDIO) {
      const tempDir = os.tmpdir()
      const inputPath = path.join(tempDir, `input_${Date.now()}`)
      const wavPath = path.join(tempDir, `ai_${Date.now()}.wav`)
      const mp3Path = path.join(tempDir, `play_${Date.now()}.mp3`)

      try {
        await fs.writeFile(inputPath, file.buffer)

        await this.speechService.convertToDual(inputPath, wavPath, mp3Path)

        const [wavBuffer, mp3Buffer] = await Promise.all([fs.readFile(wavPath), fs.readFile(mp3Path)])

        const [aiUpload, playbackUpload] = await Promise.all([
          this.cloudinaryStorage.upload(wavBuffer, folder, UploadPreset.AUDIO_AI),
          this.cloudinaryStorage.upload(mp3Buffer, folder, UploadPreset.AUDIO_PLAYBACK)
        ])

        const result = await this.fileRepository.createAudio({
          kind,
          storageKey: playbackUpload.publicId,
          provider: STORAGE_PROVIDER.CLOUDINARY,
          url: playbackUpload.url,
          aiAudioUrl: aiUpload.url,
          aiStorageKey: aiUpload.publicId,
          fileName: finalFileName.replace(/\.[^/.]+$/, '.mp3'),
          fileSize: mp3Buffer.length,
          mimeType: AUDIO_MIME_TYPES.MP3,
          ownerId: toObjectId(userId)
        })

        return this.fileMapper.toResponse(result as FileType)
      } catch (err) {
        console.error(err)
        throw new AppError('Could not process audio file.')
      } finally {
        await Promise.all([
          fs.unlink(inputPath).catch(() => {}),
          fs.unlink(wavPath).catch(() => {}),
          fs.unlink(mp3Path).catch(() => {})
        ])
      }
    }
  }

  public async uploadImage(userId: string, purpose: string, file?: Express.Multer.File) {
    return this.uploadFile(userId, purpose, FILE_KIND.IMAGE, file)
  }

  public async uploadAudio(userId: string, purpose: string, file?: Express.Multer.File) {
    return this.uploadFile(userId, purpose, FILE_KIND.AUDIO, file)
  }

  public async generateAndSaveAudio(data: {
    text: string
    voiceCode: string
    speed: number
    pitch: number
    folder: string
  }) {
    const { buffer, duration } = await this.edgeTSSProvider.textToSpeech(
      data.text,
      data.voiceCode,
      data.speed,
      data.pitch
    )

    const uploadResult = await this.cloudinaryStorage.upload(buffer, data.folder, UploadPreset.AUDIO_PLAYBACK)

    return await this.fileRepository.createAudio({
      storageKey: uploadResult.publicId,
      url: uploadResult.url,
      fileName: generateFileName('audio.mp3'),
      fileSize: uploadResult.bytes,
      mimeType: AUDIO_MIME_TYPES.MP3,
      duration,
      transcript: data.text
    })
  }

  public async findById(id: string) {
    const file = await this.fileRepository.findById(id)
    if (!file) throw new AppError('File not found', StatusCodes.NOT_FOUND)
    return file
  }
}
