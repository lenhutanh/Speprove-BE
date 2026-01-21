import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from './'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, objectIdSchema } from '~/utils'

export const createTopicSchema = createSchema({
  name: z.string(),
  forecastIds: z.array(z.string()).optional()
})

export const updateTopicSchema = updateSchema({
  name: z.string().optional(),
  status: z.number().optional(),
  forecastIds: z.array(z.string()).optional()
})

export const getTopicsSchema = querySchema({
  name: z.string().optional(),
  part: z.coerce.number().min(1).max(3).optional(),
  forecastId: z.string().regex(OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE).optional()
})
