import { emailSchema, requiredString } from '~/common/utils/validators.util'
import { updateSchema } from '../../common/base/base.validation'

export const updateProfileSchema = updateSchema({
  email: emailSchema,
  fullName: requiredString(3, 50).optional(),
  avatar: requiredString(0, 255).optional(),
  avatarPath: requiredString(0, 255).optional()
})
