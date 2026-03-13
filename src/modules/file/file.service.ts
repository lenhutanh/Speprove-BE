import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IFileRepository } from './repositories/file.repository.interface'
import {
  AUDIO_MIME_TYPES,
  AudioPurpose,
  CLOUD_FOLDERS,
  FILE_KIND,
  FileKind,
  ImagePurpose,
  PURPOSE_TO_FOLDER,
  STORAGE_PROVIDER
} from '~/common/constants/constants'
import { generateFileName, toObjectId } from '~/common/utils'
import { FileType } from './file.model'
import { AzureSpeechProvider } from '~/infrastructure/providers/ai/azure/azure-speech.provider'
import { CloudinaryStorageProvider } from '~/infrastructure/providers/storage/cloudinary-storage.provider'
import { EdgeTTSProvider } from '~/infrastructure/providers/tts/edge-tts.provider'
import { AppError } from '~/common/errors'

@singleton()
export class FileService {
  constructor(
    @inject(TOKENS.IFileRepository)
    private readonly fileRepository: IFileRepository,
    private readonly azureSpeechProvider: AzureSpeechProvider,
    private readonly edgeTSSProvider: EdgeTTSProvider,
    private readonly cloudinaryStorage: CloudinaryStorageProvider
  ) {}

  public async uploadFile(
    userId: string,
    purpose: string,
    kind: FileKind,
    file?: Express.Multer.File
  ): Promise<FileType> {
    if (!file) throw new AppError(`${kind} file is required.`)

    const uploadFn =
      kind === FILE_KIND.IMAGE
        ? this.cloudinaryStorage.uploadImage.bind(this.cloudinaryStorage)
        : this.cloudinaryStorage.uploadAudio.bind(this.cloudinaryStorage)

    const folder = PURPOSE_TO_FOLDER[purpose as ImagePurpose | AudioPurpose]

    const uploadResult = await uploadFn(file.buffer, folder)

    return (await this.fileRepository.create({
      kind,
      storageKey: uploadResult.publicId,
      provider: STORAGE_PROVIDER.CLOUDINARY,
      url: uploadResult.url,
      fileName: generateFileName(file.originalname),
      fileSize: file.size,
      mimeType: file.mimetype,
      ownerId: toObjectId(userId)
    })) as FileType
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

    const uploadResult = await this.cloudinaryStorage.uploadAudio(buffer, data.folder)

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
}
