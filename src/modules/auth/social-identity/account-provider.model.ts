import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '../../../core/persistence/base.model'
import { LOGIN_PROVIDER } from '~/modules/auth/auth.constants'

const accountProviderSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
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
  BASE_SCHEMA_OPTIONS
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
