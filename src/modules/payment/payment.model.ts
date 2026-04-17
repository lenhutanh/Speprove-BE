import mongoose from 'mongoose'
import { PAYMENT_METHOD, PAYMENT_PROVIDER, PAYMENT_STATUS } from '~/common/constants/constants'

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'Account', required: true },
  orderCode: { type: Number, unique: true, required: true },
  externalId: { type: String, required: true },

  packageId: { type: mongoose.Types.ObjectId, ref: 'CreditPackage', required: true },
  amount: { type: Number, required: true },
  points: { type: Number, required: true },

  method: { type: String, enum: Object.values(PAYMENT_METHOD) as [string, ...string[]], required: true },
  provider: { type: String, enum: Object.values(PAYMENT_PROVIDER) as [string, ...string[]], required: true },

  status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
  expiredAt: { type: Date, required: true },

  qrCode: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bin: { type: String, required: true },
  description: { type: String, required: true },

  webhookVerified: { type: Boolean, default: false },
  webhookReceivedAt: { type: Date },
  retryCount: { type: Number, default: 0 },
  paidAt: { type: Date },

  createdAt: { type: Date, default: Date.now }
})

paymentSchema.index({ orderCode: 1 })
paymentSchema.index({ userId: 1, createdAt: -1 })
paymentSchema.index({ status: 1, expiredAt: 1 })

export type PaymentType = mongoose.InferSchemaType<typeof paymentSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Payment = mongoose.models.Payment || mongoose.model<PaymentType>('Payment', paymentSchema)
