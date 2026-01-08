import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const voiceSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    accent: { type: String, required: true },
    gender: { type: Number, required: true },
    providerVoiceId: { type: String, required: true, unique: true },
    sampleUrl: { type: String, required: true, unique: true },
    status: { type: Number, required: true }
  },
  BaseSchemaOptions
)

export type VoiceSchemaType = InferSchemaType<typeof voiceSchema> & {
  _id: Types.ObjectId
}

export const Voice = models.VoiceSchema || model<VoiceSchemaType>('Voice', voiceSchema)
