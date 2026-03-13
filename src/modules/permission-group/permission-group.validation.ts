import { requiredString } from '~/common/utils/validators.util'
import { createSchema, updateSchema } from '~/common/base/base.validation'

export const createPermissionGroupSchema = createSchema({
  name: requiredString(3, 50)
})

export const updatePermissionGroupSchema = updateSchema({
  name: requiredString(3, 50).optional()
})
