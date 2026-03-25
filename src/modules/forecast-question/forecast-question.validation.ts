import z from 'zod'
import { querySchema } from '~/common/base'
import { objectIdSchema } from '~/common/utils'

export const forecastQuestionQuerySchema = z.object({
  forecastTopicId: objectIdSchema,
  part: z.coerce.number().min(1).max(3).optional()
})

export const getForecastQuestionSchema = querySchema(forecastQuestionQuerySchema.shape)
export type GetForecastQuestionType = z.infer<typeof getForecastQuestionSchema>['query']
