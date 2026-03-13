import { z } from 'zod'
import { createUnionSchema, querySchema, updateSchema } from '~/common/base/base.validation'
import { PART23_CATEGORY, PartKind } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

const commonFields = {
  content: z.string().trim().min(1),
  topicId: objectIdSchema,
  status: z.number().optional().default(1)
}

export const questionBodySchema = z.discriminatedUnion('part', [
  z.object({
    ...commonFields,
    part: z.literal(PartKind.ONE)
  }),
  z.object({
    ...commonFields,
    part: z.literal(PartKind.TWO),
    category: z.nativeEnum(PART23_CATEGORY),
    bulletPoints: z.array(z.string().trim()).optional()
  }),
  z.object({
    ...commonFields,
    part: z.literal(PartKind.THREE),
    category: z.nativeEnum(PART23_CATEGORY),
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
