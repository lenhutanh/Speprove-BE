import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'
import { FILE_KIND, STORAGE_PROVIDER } from '~/common/constants/constants'

const fileSchema = new Schema(
  {
    ...BaseSchemaContent,
    kind: {
      type: String,
      enum: Object.values(FILE_KIND),
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: Object.values(STORAGE_PROVIDER),
      required: true,
      default: STORAGE_PROVIDER.CLOUDINARY
    },
    storageKey: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, min: 0 },
    mimeType: { type: String, required: true },
    checksum: { type: String, index: true },
    status: { type: Number, required: true, default: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'Account', index: true }
  },
  {
    ...BaseSchemaOptions,
    discriminatorKey: 'kind'
  }
)

fileSchema.index({ ownerId: 1, createdAt: -1 })
fileSchema.index({ kind: 1, createdAt: -1 })

export type FileType = InferSchemaType<typeof fileSchema> & { _id: Types.ObjectId }
export const File = models.File || model<FileType>('File', fileSchema)

const audioSchema = new Schema({
  duration: { type: Number },
  transcript: { type: String }
})

export type AudioFileType = FileType & InferSchemaType<typeof audioSchema> & { kind: typeof FILE_KIND.AUDIO }
export const AudioFile =
  File.discriminators?.[FILE_KIND.AUDIO] || File.discriminator<AudioFileType>(FILE_KIND.AUDIO, audioSchema)

const imageSchema = new Schema({
  width: { type: Number },
  height: { type: Number }
})

export type ImageFileType = FileType & InferSchemaType<typeof imageSchema> & { kind: typeof FILE_KIND.IMAGE }
export const ImageFile =
  File.discriminators?.[FILE_KIND.IMAGE] || File.discriminator<ImageFileType>(FILE_KIND.IMAGE, imageSchema)
