import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { objectIdSchema } from '~/common/utils'

export const createForecastSchema = createSchema({
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnailId: objectIdSchema.optional(),
  quarter: z.number().int().min(1).max(3),
  year: z.number().int().min(2020),
  status: z.number().optional()
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

export const importTopicsSchema = updateSchema({
  topics: z
    .array(
      z.object({
        topicId: objectIdSchema,
        order: z.number().int().min(0).default(0)
      })
    )
    .default([])
})
