import z from 'zod'
import { querySchema, updateSchema } from '~/common/base'
import { objectIdSchema } from '~/common/utils'

export const forecastTopicQuerySchema = z.object({
  forecastId: objectIdSchema,
  topicId: objectIdSchema.optional(),
  part: z.coerce.number().min(1).max(3).optional()
})

export const importQuestionsSchema = updateSchema({
  questions: z
    .array(
      z.object({
        questionId: objectIdSchema,
        order: z.number().int().min(0).default(0)
      })
    )
    .default([])
})

export const getForecastTopicSchema = querySchema(forecastTopicQuerySchema.shape)
export type GetForecastTopicType = z.infer<typeof getForecastTopicSchema>['query']
