import { z } from 'zod'
import { createGroupSchema, updateGroupSchema } from '~/modules/group/group.validation'

export type CreateGroupBodyType = z.infer<typeof createGroupSchema>['body']
export type UpdateGroupBodyType = z.infer<typeof updateGroupSchema>['body']
