import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'
import { ALLOWED_ACCENTS } from '~/constants/constants'

const voiceSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    accent: { type: String, required: true, enum: Object.values(ALLOWED_ACCENTS) },
    gender: { type: Number, required: true },
    providerVoiceId: { type: String, required: true, unique: true },
    sampleUrl: { type: String, required: true },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

export type VoiceType = InferSchemaType<typeof voiceSchema> & {
  _id: Types.ObjectId
  providerVoiceId: string
}

export const Voice = models.Voice || model<VoiceType>('Voice', voiceSchema)
