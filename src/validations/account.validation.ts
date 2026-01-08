import { emailSchema, requiredString } from '~/utils/validators.util'
import { updateSchema } from './base.schema'

export const updateProfileSchema = updateSchema({
  email: emailSchema,
  fullName: requiredString(3, 50).optional(),
  avatar: requiredString(0, 255).optional(),
  avatarPath: requiredString(0, 255).optional()
})
