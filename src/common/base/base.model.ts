import { SchemaOptions } from 'mongoose'

export const BaseSchemaContent = {
  deletedAt: { type: Date, default: null }
} as const

export const BaseSchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true }
} satisfies SchemaOptions
