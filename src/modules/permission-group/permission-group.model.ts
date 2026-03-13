import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'

const permissionGroupSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true }
  },
  BaseSchemaOptions
)

export type PermissionGroupType = InferSchemaType<typeof permissionGroupSchema> & {
  _id: Types.ObjectId
}

export const PermissionGroup =
  models.PermissionGroup || model<PermissionGroupType>('PermissionGroup', permissionGroupSchema)
