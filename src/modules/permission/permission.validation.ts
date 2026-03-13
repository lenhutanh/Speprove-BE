import { createSchema, updateSchema } from '../../common/base/base.validation'
import { objectIdSchema, requiredString } from '~/common/utils/validators.util'

export const createPermissionSchema = createSchema({
  name: requiredString(3, 50),
  description: requiredString(0, 255).optional(),
  pCode: requiredString(2, 50),
  permissionGroupId: objectIdSchema
})

export const updatePermissionSchema = updateSchema({
  name: requiredString(3, 50).optional(),
  description: requiredString(0, 255).optional(),
  pCode: requiredString(2, 50).optional()
})
