import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { STATUS } from '~/common/constants/status.constants'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base/base.model'
import { GENDER_KIND } from './voice.constants'

const voiceSchema = new Schema(
  {
    ...BaseSchemaContent,
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
  BaseSchemaOptions
)

voiceSchema.index({ locale: 1, gender: 1 })

voiceSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

export type VoiceType = InferSchemaType<typeof voiceSchema> & {
  _id: Types.ObjectId
}

export const Voice = models.Voice || model<VoiceType>('Voice', voiceSchema)
