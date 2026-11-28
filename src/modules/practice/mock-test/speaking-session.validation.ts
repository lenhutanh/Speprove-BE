import z from 'zod'
import { createSchema, querySchema } from '~/core/persistence/base.validation'
import { SPEAKING_SESSION_TYPE } from './speaking-session.constants'
import { objectIdSchema } from '~/core/utils/validators.util'

export const createSpeakingSessionSchema = createSchema({
  voiceId: objectIdSchema.optional(),
  type: z.nativeEnum(SPEAKING_SESSION_TYPE)
})

export const speakingSessionQuerySchema = querySchema({
  forecastId: objectIdSchema.optional()
})
