import { z } from 'zod'
import { objectIdSchema, requiredString } from '~/common/utils/validators.util'
import { GROUP_KIND } from '~/common/constants/constants'
import { createSchema, updateSchema } from '~/common/base'

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
