import z from 'zod'
import { createSchema } from '~/common/base'
import { AUDIO_PURPOSE, IMAGE_PURPOSE } from './file.constants'

export const uploadImageSchema = createSchema({
  purpose: z.enum(Object.values(IMAGE_PURPOSE))
})

export const uploadAudioSchema = createSchema({
  purpose: z.enum(Object.values(AUDIO_PURPOSE))
})
