import mongoose from 'mongoose'
import { CREDIT_LOG_REF_TYPE, CREDIT_LOG_TYPE } from './credit-log.constants'

const creditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: Object.values(CREDIT_LOG_TYPE), required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  descriptionKey: { type: String },
  descriptionMetadata: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed },

  refType: { type: String, enum: Object.values(CREDIT_LOG_REF_TYPE) },
  refId: { type: mongoose.Schema.Types.ObjectId },

  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
})

creditLogSchema.index({ userId: 1, createdAt: -1 })

export type CreditLogType = mongoose.InferSchemaType<typeof creditLogSchema> & {
  _id: mongoose.Types.ObjectId
}

export const CreditLog = mongoose.models.CreditLog || mongoose.model<CreditLogType>('CreditLog', creditLogSchema)
