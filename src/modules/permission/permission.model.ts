import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'

const permissionSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    pCode: { type: String, required: true, unique: true, trim: true },
    permissionGroupId: { type: Schema.Types.ObjectId, ref: 'PermissionGroup', required: true }
  },
  BaseSchemaOptions
)

export type PermissionType = InferSchemaType<typeof permissionSchema> & {
  _id: Types.ObjectId
}

export const Permission = models.Permission || model<PermissionType>('Permission', permissionSchema)
