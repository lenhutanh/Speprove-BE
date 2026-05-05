import { z } from 'zod'
import { createSchema, idParamSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { FORECAST_STATUS } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createForecastSchema = createSchema({
  description: z.string().optional(),
  thumbnailId: objectIdSchema.optional(),
  quarter: z.number().int().min(1).max(3),
  year: z
    .number()
    .int()
    .min(2020)
    .max(new Date().getFullYear() + 1),
  status: z.nativeEnum(FORECAST_STATUS).optional()
})

export const updateForecastSchema = updateSchema({
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnailId: objectIdSchema.optional(),
  quarter: z.number().int().min(1).max(3).optional(),
  year: z.number().int().optional(),
  publishedAt: z.coerce.date().optional(),
  status: z.number().optional()
})

export const forecastQuerySchema = querySchema({
  quarter: z.coerce.number().min(1).max(3).optional()
})

export const importTopicsSchema = createSchema({
  topics: z.array(objectIdSchema).default([])
}).merge(idParamSchema)
