import z from 'zod'
import { attemptQuerySchema, createAttemptSchema, getLeaderboardSchema } from './attempt.validation'

export type CreateAttemptBodyType = z.infer<typeof createAttemptSchema>['body']

export type AttemptQueryType = z.infer<typeof attemptQuerySchema>['query']

export type GetTopAttemptQueryType = z.infer<typeof getLeaderboardSchema>['query']
