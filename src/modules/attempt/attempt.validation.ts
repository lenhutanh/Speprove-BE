import z from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base'
import { SPEAKING_SESSION_MODE } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createAttemptSchema = createSchema({
  speakingSessionId: objectIdSchema.optional(),
  forecastQuestionId: objectIdSchema,
  audioFileId: objectIdSchema,
  mode: z.nativeEnum(SPEAKING_SESSION_MODE)
})

export const attemptQuerySchema = querySchema({
  forecastQuestionId: objectIdSchema.optional()
})

export const getLeaderboardSchema = querySchema({
  forecastQuestionId: objectIdSchema,
  band: z.coerce.number().int().min(6).max(8)
})

export const shareAttemptSchema = updateSchema({
  isPublic: z.boolean()
})
