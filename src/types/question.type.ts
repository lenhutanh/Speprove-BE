import z from 'zod'
import { createQuestionSchema, updateQuestionSchema } from '~/validations'

export type CreateQuestionBodyType = z.infer<typeof createQuestionSchema>['body']
export type UpdateQuestionBodyType = z.infer<typeof updateQuestionSchema>['body']
