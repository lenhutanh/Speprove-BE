import z from 'zod'
import { createSchema, idParamSchema, querySchema, simpleQuerySchema, updateSchema } from '~/common/base'
import { SPEAKING_SESSION_MODE } from '../speaking-session/speaking-session.constants'
import { objectIdSchema } from '~/common/utils'

export const createAttemptSchema = createSchema({
  speakingSessionId: objectIdSchema.optional(),
  forecastQuestionId: objectIdSchema,
  audioFileId: objectIdSchema,
  mode: z.nativeEnum(SPEAKING_SESSION_MODE)
}).refine(
  (data) => {
    if (data.body.mode === SPEAKING_SESSION_MODE.MOCK && !data.body.speakingSessionId) {
      return false
    }
    return true
  },
  {
    message: 'speakingSessionId is required when mode is MOCK',
    path: ['speakingSessionId']
  }
)

export const attemptQuerySchema = querySchema({
  forecastQuestionId: objectIdSchema.optional(),
  speakingSessionId: objectIdSchema.optional()
})

export const getLeaderboardSchema = querySchema({
  forecastQuestionId: objectIdSchema,
  band: z.coerce.number().int().min(6).max(8)
})

export const shareAttemptSchema = updateSchema({
  isPublic: z.boolean()
})

export const getWordAudioSchema = simpleQuerySchema({
  wordIndex: z.coerce.number().int().min(0)
}).merge(idParamSchema)
