import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base/base.model'
import { STATUS } from '~/common/constants/status.constants'

const generatedAudioSchema = new Schema(
  {
    ...BaseSchemaContent,
    text: { type: String, required: true, trim: true },
    normalizedText: { type: String, required: true, index: true },
    voiceId: { type: Schema.Types.ObjectId, ref: 'Voice', required: true, index: true },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    cacheKey: { type: String, required: true, unique: true, index: true },
    lastUsedAt: { type: Date, default: Date.now, index: true },
    status: { type: Number, default: STATUS.ACTIVE, required: true }
  },
  BaseSchemaOptions
)

generatedAudioSchema.index({ normalizedText: 1, voiceId: 1 })

export type GeneratedAudioType = InferSchemaType<typeof generatedAudioSchema> & {
  _id: Types.ObjectId
}

export type GeneratedAudioWithFile = Omit<GeneratedAudioType, 'fileId'> & {
  fileId: any
}

export const GeneratedAudio = models.GeneratedAudio || model<GeneratedAudioType>('GeneratedAudio', generatedAudioSchema)
