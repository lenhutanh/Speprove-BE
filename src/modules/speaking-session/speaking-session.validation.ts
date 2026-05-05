import z from 'zod'
import { createSchema, querySchema } from '~/common/base'
import { SPEAKING_SESSION_TYPE } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createSpeakingSessionSchema = createSchema({
  voiceId: objectIdSchema.optional(),
  type: z.nativeEnum(SPEAKING_SESSION_TYPE)
})

export const speakingSessionQuerySchema = querySchema({
  forecastId: objectIdSchema.optional()
})
