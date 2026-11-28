import z from 'zod'
import { createSpeakingSessionSchema, speakingSessionQuerySchema } from './speaking-session.validation'

export type CreateSpeakingSessionBodyType = z.infer<typeof createSpeakingSessionSchema>['body']

export type SpeakingSessionQueryType = z.infer<typeof speakingSessionQuerySchema>['query']
