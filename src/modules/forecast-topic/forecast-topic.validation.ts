import { querySchema } from '~/common/base'
import { objectIdSchema } from '~/common/utils'

export const forecastTopicQuerySchema = querySchema({
  forecastId: objectIdSchema,
  topicId: objectIdSchema.optional()
})
