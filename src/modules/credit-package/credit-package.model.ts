import mongoose from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'

const creditPackageSchema = new mongoose.Schema(
  {
    ...BaseSchemaContent,
    amount: { type: Number, required: true },
    points: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  BaseSchemaOptions
)

export type CreditPackageType = mongoose.InferSchemaType<typeof creditPackageSchema> & {
  _id: mongoose.Types.ObjectId
}

export const CreditPackage =
  mongoose.models.CreditPackage || mongoose.model<CreditPackageType>('CreditPackage', creditPackageSchema)
