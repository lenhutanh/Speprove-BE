import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'

const topicSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: Number,
      required: true,
      default: 1
    }
  },
  BASE_SCHEMA_OPTIONS
)

topicSchema.index({ status: 1 })

export type TopicType = InferSchemaType<typeof topicSchema> & {
  _id: Types.ObjectId
}

export const Topic = models.Topic || model<TopicType>('Topic', topicSchema)
