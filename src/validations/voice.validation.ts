import z from 'zod'
import { createSchema, updateSchema } from './'
import { ALLOWED_ACCENTS, GENDER_KIND, SUPPORTED_VOICE_IDS } from '~/constants/constants'

export const createVoiceSchema = createSchema({
  name: z.string(),
  accent: z.enum(Object.values(ALLOWED_ACCENTS) as [string, ...string[]]),
  gender: z.nativeEnum(GENDER_KIND),
  providerVoiceId: z.enum(SUPPORTED_VOICE_IDS)
})

export const updateVoiceSchema = updateSchema({
  name: z.string().optional(),
  accent: z.enum(Object.values(ALLOWED_ACCENTS) as [string, ...string[]]).optional(),
  gender: z.nativeEnum(GENDER_KIND).optional(),
  providerVoiceId: z.enum(SUPPORTED_VOICE_IDS).optional()
})
