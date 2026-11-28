import { requiredString } from '~/core/utils/validators.util'
import { createSchema, updateSchema } from '~/core/persistence/base.validation'

export const createPermissionGroupSchema = createSchema({
  name: requiredString(3, 50)
})

export const updatePermissionGroupSchema = updateSchema({
  name: requiredString(3, 50).optional()
})
