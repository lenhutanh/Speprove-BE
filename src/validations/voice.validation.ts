import z from 'zod'
import { createSchema, updateSchema } from './'
import { GENDER_KIND } from '~/constants/constants'

export const createVoiceSchema = createSchema({
  name: z.string(),
  accent: z.string(),
  gender: z.nativeEnum(GENDER_KIND),
  providerVoiceId: z.string()
})

export const updateVoiceSchema = updateSchema({
  name: z.string().optional(),
  accent: z.string().optional(),
  gender: z.number().optional(),
  providerVoiceId: z.string()
})
