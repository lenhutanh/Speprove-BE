import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'

const forecastTopicSchema = new Schema(
  {
    ...BaseSchemaContent,
    forecastId: {
      type: Schema.Types.ObjectId,
      ref: 'Forecast',
      required: true
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  BaseSchemaOptions
)

forecastTopicSchema.index({ forecastId: 1, topicId: 1 }, { unique: true })

export type ForecastTopicType = InferSchemaType<typeof forecastTopicSchema> & {
  _id: Types.ObjectId
}

export const ForecastTopic = models.ForecastTopic || model<ForecastTopicType>('ForecastTopic', forecastTopicSchema)
