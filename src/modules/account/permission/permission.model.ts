import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '../../../core/persistence/base.model'

const permissionSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    pCode: { type: String, required: true, unique: true, trim: true },
    permissionGroupId: { type: Schema.Types.ObjectId, ref: 'PermissionGroup', required: true }
  },
  BASE_SCHEMA_OPTIONS
)

export type PermissionType = InferSchemaType<typeof permissionSchema> & {
  _id: Types.ObjectId
}

export const Permission = models.Permission || model<PermissionType>('Permission', permissionSchema)
