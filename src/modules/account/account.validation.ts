import { objectIdSchema, requiredString } from '~/core/utils/validators.util'
import { updateSchema } from '../../core/persistence/base.validation'

export const updateProfileSchema = updateSchema({
  avatarId: objectIdSchema.nullable().optional(),
  fullName: requiredString(1, 56).optional()
})

export const updateSelectedVoiceSchema = updateSchema({
  selectedVoiceId: objectIdSchema
})
