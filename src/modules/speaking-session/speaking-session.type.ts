import z from 'zod'
import { createSpeakingSessionSchema } from './speaking-session.validation'

export type CreateSpeakingSessionBodyType = z.infer<typeof createSpeakingSessionSchema>['body']
