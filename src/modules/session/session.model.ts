import { InferSchemaType, model, models, Schema } from 'mongoose'
import { BaseSchemaOptions } from '~/common/base/base.model'

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Account', unique: true, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    deviceInfo: { type: String },
    ipAddress: { type: String }
  },
  BaseSchemaOptions
)

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export type SessionType = InferSchemaType<typeof sessionSchema>

export const Session = models.Session || model<SessionType>('Session', sessionSchema)
