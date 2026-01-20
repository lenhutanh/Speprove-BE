import z from 'zod'
import { createTopicSchema, updateTopicSchema } from '~/validations'

export type CreateTopicBodyType = z.infer<typeof createTopicSchema>['body']
export type UpdateTopicBodyType = z.infer<typeof updateTopicSchema>['body']
