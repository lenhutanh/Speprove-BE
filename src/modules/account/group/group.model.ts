import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '../../../core/persistence/base.model'

const groupSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    kind: { type: Number, required: true },
    permissionIds: [{ type: Schema.Types.ObjectId, ref: 'Permission' }]
  },
  BASE_SCHEMA_OPTIONS
)

export type GroupType = InferSchemaType<typeof groupSchema> & {
  _id: Types.ObjectId
}

export const Group = models.Group || model<GroupType>('Group', groupSchema)
