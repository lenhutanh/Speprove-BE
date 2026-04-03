import z from 'zod'
import { createSchema } from '~/common/base'
import { SPEAKING_SESSION_MODE } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createAttemptSchema = createSchema({
  speakingSessionId: objectIdSchema.optional(),
  forecastQuestionId: objectIdSchema,
  audioFileId: objectIdSchema,
  mode: z.nativeEnum(SPEAKING_SESSION_MODE)
})
