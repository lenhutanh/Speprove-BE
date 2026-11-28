import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { STATUS } from '~/core/persistence/status.constants'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'
import { GENDER_KIND } from './voice.constants'

const voiceSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    name: { type: String, required: true, unique: true, trim: true },
    voiceCode: { type: String, required: true, unique: true },
    gender: { type: Number, enum: Object.values(GENDER_KIND), required: true },
    locale: { type: String, required: true },
    speed: { type: Number, required: true, min: 0.5, max: 2, default: 1 },
    pitch: { type: Number, min: -20, max: 20, default: 0 },
    sampleAudioFileId: { type: Schema.Types.ObjectId, ref: 'File', index: true },
    status: { type: Number, default: STATUS.PENDING, required: true },
    isDefault: { type: Boolean, default: false }
  },
  BASE_SCHEMA_OPTIONS
)

voiceSchema.index({ locale: 1, gender: 1 })

voiceSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

export type VoiceType = InferSchemaType<typeof voiceSchema> & {
  _id: Types.ObjectId
}

export const Voice = models.Voice || model<VoiceType>('Voice', voiceSchema)
