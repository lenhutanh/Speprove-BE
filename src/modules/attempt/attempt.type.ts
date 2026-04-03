import z from 'zod'
import { createAttemptSchema } from './attempt.validation'

export type CreateAttemptBodyType = z.infer<typeof createAttemptSchema>['body']
