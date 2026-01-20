import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const topicSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: Number, required: true, default: 1 },
    forecastIds: [{ type: Types.ObjectId, ref: 'Forecast' }]
  },
  BaseSchemaOptions
)

export type TopicType = InferSchemaType<typeof topicSchema> & {
  _id: Types.ObjectId
}

export const Topic = models.Topic || model<TopicType>('Topic', topicSchema)
