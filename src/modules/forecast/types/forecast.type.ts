import { z } from 'zod'
import { createForecastSchema, getForecastsSchema, updateForecastSchema } from '~/modules/forecast/forecast.validation'

export type CreateForecastBodyType = z.infer<typeof createForecastSchema>['body']
export type UpdateForecastBodyType = z.infer<typeof updateForecastSchema>['body']
export type ForecastQueryType = z.infer<typeof getForecastsSchema>['query']
