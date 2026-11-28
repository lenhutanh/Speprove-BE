import { querySchema } from '~/core/persistence/base.validation'
import { objectIdSchema } from '~/core/utils/validators.util'

export const forecastTopicQuerySchema = querySchema({
  forecastId: objectIdSchema,
  topicId: objectIdSchema.optional()
})
