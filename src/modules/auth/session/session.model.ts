import { InferSchemaType, model, models, Schema } from 'mongoose'
import { BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Account', unique: true, required: true, index: true },
    sid: { type: String, required: true, unique: true, sparse: true, index: true },
    token: { type: String, required: true, unique: true },
    refreshTokenId: { type: String, required: true, unique: true, sparse: true },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: null },
    deviceInfo: { type: String },
    ipAddress: { type: String }
  },
  BASE_SCHEMA_OPTIONS
)

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export type SessionType = InferSchemaType<typeof sessionSchema>

export const Session = models.Session || model<SessionType>('Session', sessionSchema)
