import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from './base.model'

const forecastSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    thumbnail: { type: String },
    quarter: { type: Number, required: true },
    year: { type: Number, required: true },
    publishedAt: { type: Date, default: Date.now },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

export type ForecastType = InferSchemaType<typeof forecastSchema> & {
  _id: Types.ObjectId
}

export const Forecast = models.Forecast || model<ForecastType>('Forecast', forecastSchema)
