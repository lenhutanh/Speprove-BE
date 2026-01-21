import { z } from 'zod'
import { createForecastSchema, getForecastsSchema } from '~/validations'

export type CreateForecastBodyType = z.infer<typeof createForecastSchema>['body']
export type UpdateForecastBodyType = z.infer<typeof createForecastSchema>['body']
export type ForecastQueryType = z.infer<typeof getForecastsSchema>['query']
