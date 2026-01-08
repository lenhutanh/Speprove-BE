import { createSchema, updateSchema } from './base.schema'
import { requiredString } from '~/utils/validators.util'

export const createPermissionGroupSchema = createSchema({
  name: requiredString(3, 50)
})

export const updatePermissionGroupSchema = updateSchema({
  name: requiredString(3, 50).optional()
})
