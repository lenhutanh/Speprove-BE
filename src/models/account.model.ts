import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './index'
import { ACCOUNT_KIND, STATUS } from '~/constants/constants'

const accountSchema = new Schema(
  {
    ...BaseSchemaContent,
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, trim: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    avatarPath: { type: String, default: '' },
    isSuperAdmin: { type: Boolean, default: false },
    kind: { type: Number, default: ACCOUNT_KIND.USER },
    status: { type: Number, default: STATUS.PENDING }
  },
  BaseSchemaOptions
)

export type AccountType = InferSchemaType<typeof accountSchema> & {
  _id: Types.ObjectId
}

export const Account = models.Account || model<AccountType>('Account', accountSchema)
