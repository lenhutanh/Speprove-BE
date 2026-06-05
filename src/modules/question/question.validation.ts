import { z } from 'zod'
import { createUnionSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { PART2_CATEGORY, PART_KIND } from './question.constants'
import { objectIdSchema } from '~/common/utils'

const commonFields = {
  content: z.string().trim().min(1),
  status: z.number().optional().default(1)
}

export const questionBodySchema = z.discriminatedUnion('part', [
  z.object({
    ...commonFields,
    part: z.literal(PART_KIND.ONE),
    topicId: objectIdSchema
  }),
  z.object({
    ...commonFields,
    part: z.literal(PART_KIND.TWO),
    category: z.nativeEnum(PART2_CATEGORY),
    bulletPoints: z.array(z.string().trim())
  }),
  z.object({
    ...commonFields,
    part: z.literal(PART_KIND.THREE),
    parentId: objectIdSchema
  })
])

export const createQuestionSchema = createUnionSchema(questionBodySchema)

export const updateQuestionSchema = updateSchema({
  content: z.string().optional(),
  part: z.number().optional(),
  status: z.number().optional(),
  topicId: z.string().optional(),
  bulletPoints: z.array(z.string()).optional()
})

export const questionFilterSchema = z.object({
  part: z.coerce.number().min(1).max(3).optional(),
  topicId: objectIdSchema
})

export const getQuestionsSchema = querySchema(questionFilterSchema.shape)
