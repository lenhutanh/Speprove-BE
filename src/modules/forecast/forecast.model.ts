import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'

const forecastSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    thumbnailId: { type: Schema.Types.ObjectId, ref: 'File' },
    quarter: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 }
  },
  BaseSchemaOptions
)

forecastSchema.index({ quarter: 1, year: 1 }, { unique: true })

export type ForecastType = InferSchemaType<typeof forecastSchema> & {
  _id: Types.ObjectId
}

export const Forecast = models.Forecast || model<ForecastType>('Forecast', forecastSchema)
