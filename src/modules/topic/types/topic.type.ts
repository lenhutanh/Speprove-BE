import { z } from 'zod'
import {
  createTopicSchema,
  getTopicsSchema,
  topicFilterSchema,
  updateTopicSchema
} from '~/modules/topic/topic.validation'

export type CreateTopicBodyType = z.infer<typeof createTopicSchema>['body']
export type UpdateTopicBodyType = z.infer<typeof updateTopicSchema>['body']
export type TopicFilterType = z.infer<typeof topicFilterSchema>
export type TopicsQueryType = z.infer<typeof getTopicsSchema>['query']
