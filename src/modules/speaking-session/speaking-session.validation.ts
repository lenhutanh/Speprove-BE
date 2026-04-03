import z from 'zod'
import { createSchema } from '~/common/base'
import { SPEAKING_SESSION_TYPE } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createSpeakingSessionSchema = createSchema({
  forecastId: objectIdSchema,
  type: z.nativeEnum(SPEAKING_SESSION_TYPE)
})
