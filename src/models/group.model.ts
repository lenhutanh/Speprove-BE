import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const groupSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    kind: { type: Number },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }]
  },
  BaseSchemaOptions
)

export type GroupType = InferSchemaType<typeof groupSchema> & {
  _id: Types.ObjectId
}

export const Group = models.Group || model<GroupType>('Group', groupSchema)
