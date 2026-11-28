import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'

const forecastTopicSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
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
  BASE_SCHEMA_OPTIONS
)

forecastTopicSchema.index({ forecastId: 1, topicId: 1 }, { unique: true })

export type ForecastTopicType = InferSchemaType<typeof forecastTopicSchema> & {
  _id: Types.ObjectId
}

export const ForecastTopic = models.ForecastTopic || model<ForecastTopicType>('ForecastTopic', forecastTopicSchema)
