import z from 'zod'
import { createSchema, updateSchema } from './'

export const createQuestionSchema = createSchema({
  content: z.string(),
  part: z.number(),
  topicId: z.string(),
  bulletPoints: z.array(z.string()).optional()
})

export const updateQuestionSchema = updateSchema({
  content: z.string().optional(),
  part: z.number().optional(),
  status: z.number().optional(),
  topicId: z.string().optional(),
  bulletPoints: z.array(z.string()).optional()
})
