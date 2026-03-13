import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'

const topicSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

topicSchema.index({ status: 1 })

export type TopicType = InferSchemaType<typeof topicSchema> & {
  _id: Types.ObjectId
}

export const Topic = models.Topic || model<TopicType>('Topic', topicSchema)
