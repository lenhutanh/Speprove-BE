import z from 'zod'
import { createVoiceSchema, updateVoiceSchema } from '~/validations'

export type CreateVoiceBodyType = z.infer<typeof createVoiceSchema>['body']
export type UpdateVoiceBodyType = z.infer<typeof updateVoiceSchema>['body']
