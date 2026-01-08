import { SchemaDefinition, SchemaOptions } from 'mongoose'

export const BaseSchemaContent: SchemaDefinition = {
  deletedAt: { type: Date, default: null }
}

export const BaseSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true }
}
