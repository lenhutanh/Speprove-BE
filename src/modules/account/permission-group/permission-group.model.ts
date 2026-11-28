import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '../../../core/persistence/base.model'

const permissionGroupSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    name: { type: String, required: true, unique: true, trim: true }
  },
  BASE_SCHEMA_OPTIONS
)

export type PermissionGroupType = InferSchemaType<typeof permissionGroupSchema> & {
  _id: Types.ObjectId
}

export const PermissionGroup =
  models.PermissionGroup || model<PermissionGroupType>('PermissionGroup', permissionGroupSchema)
