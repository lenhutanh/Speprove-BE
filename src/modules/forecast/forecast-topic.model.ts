import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base/base.model'

const forecastTopicSchema = new Schema(
  {
    ...BaseSchemaContent,
    forecastId: { type: Types.ObjectId, ref: 'Forecast', required: true },
    topicId: { type: Types.ObjectId, ref: 'Topic', required: true },
    weight: { type: Number, default: 0 },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

forecastTopicSchema.index({ forecastId: 1, topicId: 1 }, { unique: true })

export type ForecastTopicType = InferSchemaType<typeof forecastTopicSchema> & {
  _id: Types.ObjectId
}

export const ForecastTopic = models.ForecastTopic || model<ForecastTopicType>('ForecastTopic', forecastTopicSchema)
