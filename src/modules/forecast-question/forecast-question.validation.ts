import z from 'zod'
import { querySchema } from '~/common/base'
import { objectIdSchema } from '~/common/utils'

export const forecastQuestionQuerySchema = querySchema({
  forecastTopicId: objectIdSchema,
  part: z.union([z.coerce.number().min(1).max(3), z.string().regex(/^[1-3](,[1-3])*$/)]).optional()
})
