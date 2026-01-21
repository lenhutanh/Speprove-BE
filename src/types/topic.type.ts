import z from 'zod'
import { createTopicSchema, getTopicsSchema, updateTopicSchema } from '~/validations'

export type CreateTopicBodyType = z.infer<typeof createTopicSchema>['body']
export type UpdateTopicBodyType = z.infer<typeof updateTopicSchema>['body']
export type TopicsQueryType = z.infer<typeof getTopicsSchema>['query']
