import { z } from 'zod'
import { createSchema, idParamSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { FORECAST_STATUS } from './forecast.constants'
import { objectIdSchema } from '~/common/utils'
import { PART2_CATEGORY } from '~/modules/question/question.constants'

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

export const getForecastsSchema = forecastQuerySchema

export const importTopicsSchema = createSchema({
  topics: z.array(objectIdSchema).default([])
}).merge(idParamSchema)

export const importForecastSchema = createSchema({
  quarter: z.number().int().min(1).max(3),
  year: z
    .number()
    .int()
    .min(2020)
    .max(new Date().getFullYear() + 2),
  isDefault: z.boolean().optional().default(false),
  part1: z
    .array(
      z.object({
        topicName: z.string().min(1),
        questions: z.array(z.string().min(1))
      })
    )
    .default([]),
  part23: z
    .array(
      z.object({
        cueCard: z.string().min(1),
        category: z.nativeEnum(PART2_CATEGORY),
        bullets: z.array(z.string()).default([]),
        part3Questions: z.array(z.string()).default([])
      })
    )
    .default([])
})
