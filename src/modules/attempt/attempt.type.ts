import z from 'zod'
import { attemptQuerySchema, createAttemptSchema } from './attempt.validation'

export type CreateAttemptBodyType = z.infer<typeof createAttemptSchema>['body']

export type AttemptQueryType = z.infer<typeof attemptQuerySchema>['query']
