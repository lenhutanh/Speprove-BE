import z from 'zod'
import { createSchema, idParamSchema, querySchema, simpleQuerySchema } from '~/common/base'
import { PART2_CATEGORY, PART_GROUP, PART_KIND } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const forecastQuestionQuerySchema = querySchema({
  forecastId: objectIdSchema,
  forecastTopicId: objectIdSchema.optional(),
  part: z.nativeEnum(PART_GROUP).optional(),
  category: z.nativeEnum(PART2_CATEGORY).optional()
})

export const getAttemptsOfQuestionSchema = querySchema({
  band: z.coerce.number().min(1).max(9)
})

export const getForecastQuestionDetailQuerySchema = simpleQuerySchema({
  voiceId: objectIdSchema
}).merge(idParamSchema)

export const importQuestionsSchema = createSchema({
  forecastId: objectIdSchema,
  part: z.nativeEnum(PART_KIND),
  questionIds: z.array(objectIdSchema),
  forecastTopicId: objectIdSchema.optional()
})
