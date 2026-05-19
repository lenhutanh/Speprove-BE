import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'
import { LOGIN_PROVIDER } from '~/common/constants/constants'

const accountProviderSchema = new Schema(
  {
    ...BaseSchemaContent,
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: Object.values(LOGIN_PROVIDER),
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  BaseSchemaOptions
)

accountProviderSchema.index(
  {
    provider: 1,
    providerId: 1
  },
  {
    unique: true
  }
)

accountProviderSchema.index(
  {
    accountId: 1,
    provider: 1
  },
  {
    unique: true
  }
)

export type AccountProviderType = InferSchemaType<typeof accountProviderSchema> & {
  _id: Types.ObjectId
}

export const AccountProvider =
  models.AccountProvider || model<AccountProviderType>('AccountProvider', accountProviderSchema)
