import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { objectIdSchema } from '~/common/utils'

export const createForecastSchema = createSchema({
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnailId: objectIdSchema.optional(),
  quarter: z.number().min(1).max(3),
  year: z.number(),
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

export const forecastFilterSchema = z.object({
  quarter: z.coerce.number().min(1).max(3).optional()
})

export const getForecastsSchema = querySchema(forecastFilterSchema.shape)

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

export const importQuestionsSchema = updateSchema({
  topicId: objectIdSchema,
  questions: z
    .array(
      z.object({
        questionId: objectIdSchema,
        order: z.number().int().min(0).default(0)
      })
    )
    .default([])
})
