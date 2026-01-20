import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from './base.schema'

export const createForecastSchema = createSchema({
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  quarter: z.number(),
  year: z.number(),
  publishedAt: z.coerce.date().optional(),
  status: z.number().optional()
})

export const updateForecastSchema = updateSchema({
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  quarter: z.number().optional(),
  year: z.number().optional(),
  publishedAt: z.coerce.date().optional(),
  status: z.number().optional()
})

export const getForecastsSchema = querySchema({})
