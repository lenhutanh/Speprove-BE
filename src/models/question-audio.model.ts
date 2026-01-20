import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const questionAudioSchema = new Schema(
  {
    ...BaseSchemaContent,
    questionId: { type: Types.ObjectId, ref: 'Question', required: true },
    voiceId: { type: Types.ObjectId, ref: 'Voice', required: true },
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

export type QuestionAudioType = InferSchemaType<typeof questionAudioSchema>

export const QuestionAudio = models.QuestionAudio || model<QuestionAudioType>('QuestionAudio', questionAudioSchema)
