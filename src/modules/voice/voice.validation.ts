import { z } from 'zod'
import { createSchema } from '~/common/base/base.validation'
import { GENDER_KIND, VOICES } from './voice.constants'

export const createVoiceSchema = createSchema({
  name: z
    .string()
    .min(1)
    .transform((str) => str.trim()),
  gender: z.nativeEnum(GENDER_KIND),
  voiceCode: z.enum(VOICES),
  speed: z.number().min(0.5).max(2).optional(),
  pitch: z.number().min(-20).max(20).optional()
})

export const updateVoiceSchema = createVoiceSchema.partial()
