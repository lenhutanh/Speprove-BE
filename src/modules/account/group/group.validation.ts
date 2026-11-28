import { z } from 'zod'
import { objectIdSchema, requiredString } from '~/core/utils/validators.util'
import { GROUP_KIND } from './group.constants'
import { createSchema, updateSchema } from '~/core/persistence/base.validation'

export const createGroupSchema = createSchema({
  name: requiredString(3, 50),
  description: requiredString(0, 255).optional(),
  kind: z.nativeEnum(GROUP_KIND).optional(),
  permissionIds: z.array(objectIdSchema).optional()
})

export const updateGroupSchema = updateSchema({
  name: requiredString(3, 50).optional(),
  description: requiredString(0, 255).optional(),
  permissionIds: z.array(objectIdSchema).optional()
})
