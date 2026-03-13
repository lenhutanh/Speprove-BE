import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'

const forecastQuestionSchema = new Schema(
  {
    ...BaseSchemaContent,
    forecastId: { type: Schema.Types.ObjectId, ref: 'Forecast', required: true },
    forecastTopicId: { type: Schema.Types.ObjectId, ref: 'ForecastTopic', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    order: { type: Number, default: 0 }
  },
  BaseSchemaOptions
)

forecastQuestionSchema.index({ forecastId: 1, questionId: 1 }, { unique: true })

export type ForecastQuestionType = InferSchemaType<typeof forecastQuestionSchema> & {
  _id: Types.ObjectId
}

export const ForecastQuestion =
  models.ForecastQuestion || model<ForecastQuestionType>('ForecastQuestion', forecastQuestionSchema)
