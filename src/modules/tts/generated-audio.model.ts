import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'
import { STATUS } from '~/core/persistence/status.constants'

const generatedAudioSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    text: { type: String, required: true, trim: true },
    normalizedText: { type: String, required: true, index: true },
    voiceId: { type: Schema.Types.ObjectId, ref: 'Voice', required: true, index: true },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    cacheKey: { type: String, required: true, unique: true, index: true },
    lastUsedAt: { type: Date, default: Date.now, index: true },
    status: { type: Number, default: STATUS.ACTIVE, required: true }
  },
  BASE_SCHEMA_OPTIONS
)

generatedAudioSchema.index({ normalizedText: 1, voiceId: 1 })

export type GeneratedAudioType = InferSchemaType<typeof generatedAudioSchema> & {
  _id: Types.ObjectId
}

export type GeneratedAudioWithFile = Omit<GeneratedAudioType, 'fileId'> & {
  fileId: any
}

export const GeneratedAudio = models.GeneratedAudio || model<GeneratedAudioType>('GeneratedAudio', generatedAudioSchema)
