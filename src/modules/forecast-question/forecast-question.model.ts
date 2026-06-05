import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'
import { PART_KIND } from '../question/question.constants'

const forecastQuestionSchema = new Schema(
  {
    ...BaseSchemaContent,
    forecastId: {
      type: Schema.Types.ObjectId,
      ref: 'Forecast',
      required: true
    },
    forecastTopicId: {
      type: Schema.Types.ObjectId,
      ref: 'ForecastTopic',
      required: function (this: any) {
        return this.part === PART_KIND.ONE
      },
      index: true,
      sparse: true
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    part: {
      type: Number,
      enum: Object.values(PART_KIND),
      required: true,
      index: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  BaseSchemaOptions
)

forecastQuestionSchema.index({ forecastId: 1, questionId: 1 }, { unique: true })

forecastQuestionSchema.index({ forecastId: 1, part: 1 })

export type ForecastQuestionType = InferSchemaType<typeof forecastQuestionSchema> & {
  _id: Types.ObjectId
}

export const ForecastQuestion =
  models.ForecastQuestion || model<ForecastQuestionType>('ForecastQuestion', forecastQuestionSchema)
