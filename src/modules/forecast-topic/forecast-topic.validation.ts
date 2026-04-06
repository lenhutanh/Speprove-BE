import z from 'zod'
import { querySchema, updateSchema } from '~/common/base'
import { objectIdSchema } from '~/common/utils'

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

export const forecastTopicQuerySchema = querySchema({
  forecastId: objectIdSchema,
  topicId: objectIdSchema.optional()
})
