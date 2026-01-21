import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const questionSchema = new Schema(
  {
    ...BaseSchemaContent,
    content: { type: String, required: true, trim: true },
    part: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 },
    topicId: { type: Types.ObjectId, ref: 'Topic', required: true },
    bulletPoints: [{ type: String, default: undefined }]
  },
  BaseSchemaOptions
)

questionSchema.index({ topicId: 1, part: 1 })

export type QuestionType = InferSchemaType<typeof questionSchema>

export const Question = models.Question || model<QuestionType>('Question', questionSchema)
