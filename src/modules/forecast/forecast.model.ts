import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'
import { FORECAST_STATUS } from '~/common/constants/constants'

const forecastSchema = new Schema(
  {
    ...BaseSchemaContent,
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    thumbnailId: { type: Schema.Types.ObjectId, ref: 'File' },
    quarter: { type: Number, required: true },
    year: { type: Number, required: true },
    isDefault: { type: Boolean, required: true, default: false },
    status: { type: String, enum: Object.values(FORECAST_STATUS), required: true, default: FORECAST_STATUS.DRAFT }
  },
  BaseSchemaOptions
)

forecastSchema.index({ quarter: 1, year: 1 }, { unique: true })

forecastSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

export type ForecastType = InferSchemaType<typeof forecastSchema> & {
  _id: Types.ObjectId
}

export const Forecast = models.Forecast || model<ForecastType>('Forecast', forecastSchema)
