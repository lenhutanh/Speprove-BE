import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'

const questionAudioSchema = new Schema(
  {
    ...BaseSchemaContent,
    questionId: { type: Types.ObjectId, ref: 'Question', required: true },
    voiceId: { type: Types.ObjectId, ref: 'Voice', required: true },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    contentHash: { type: String, required: true, unique: true },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

questionAudioSchema.index({ questionId: 1, voiceId: 1 }, { unique: true })

export type QuestionAudioType = InferSchemaType<typeof questionAudioSchema> & {
  _id: Types.ObjectId
}

export const QuestionAudio = models.QuestionAudio || model<QuestionAudioType>('QuestionAudio', questionAudioSchema)
