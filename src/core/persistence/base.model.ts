import { SchemaOptions } from 'mongoose'

export const BASE_SCHEMA_CONTENT = {
  deletedAt: { type: Date, default: null }
} as const

export const BASE_SCHEMA_OPTIONS = {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true }
} satisfies SchemaOptions
