import { objectIdSchema, requiredString } from '~/common/utils/validators.util'
import { updateSchema } from '../../common/base/base.validation'

export const updateProfileSchema = updateSchema({
  avatarId: objectIdSchema.nullable().optional(),
  fullName: requiredString(1, 56).optional()
})

export const updateSelectedVoiceSchema = updateSchema({
  selectedVoiceId: objectIdSchema
})
