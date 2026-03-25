import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base/base.validation'

export const createTopicSchema = createSchema({
  name: z.string(),
  part: z.number().min(1).max(3)
})

export const updateTopicSchema = updateSchema({
  name: z.string().optional(),
  status: z.number().optional()
})

export const topicFilterSchema = z.object({
  name: z.string().optional()
})

export const getTopicsSchema = querySchema(topicFilterSchema.shape)
