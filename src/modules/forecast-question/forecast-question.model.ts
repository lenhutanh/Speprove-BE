import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'

const forecastQuestionSchema = new Schema(
  {
    ...BaseSchemaContent,
    forecastTopicId: { type: Schema.Types.ObjectId, ref: 'ForecastTopic', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    part: { type: Number, required: true },
    order: { type: Number, default: 0 }
  },
  BaseSchemaOptions
)

forecastQuestionSchema.index({ forecastTopicId: 1, questionId: 1 }, { unique: true })

export type ForecastQuestionType = InferSchemaType<typeof forecastQuestionSchema> & {
  _id: Types.ObjectId
}

export const ForecastQuestion =
  models.ForecastQuestion || model<ForecastQuestionType>('ForecastQuestion', forecastQuestionSchema)
