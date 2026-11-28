import mongoose from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'

const creditPackageSchema = new mongoose.Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    amount: { type: Number, required: true },
    points: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  BASE_SCHEMA_OPTIONS
)

export type CreditPackageType = mongoose.InferSchemaType<typeof creditPackageSchema> & {
  _id: mongoose.Types.ObjectId
}

export const CreditPackage =
  mongoose.models.CreditPackage || mongoose.model<CreditPackageType>('CreditPackage', creditPackageSchema)
