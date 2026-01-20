import z from 'zod'
import { createSchema, updateSchema } from './'

export const createTopicSchema = createSchema({
  name: z.string(),
  forecastIds: z.array(z.string()).optional()
})

export const updateTopicSchema = updateSchema({
  name: z.string().optional(),
  status: z.number().optional(),
  forecastIds: z.array(z.string()).optional()
})
