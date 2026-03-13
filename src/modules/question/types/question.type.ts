import { z } from 'zod'
import {
  getQuestionsSchema,
  questionBodySchema,
  questionFilterSchema,
  updateQuestionSchema
} from '~/modules/question/question.validation'

export type CreateQuestionBodyType = z.infer<typeof questionBodySchema>
export type UpdateQuestionBodyType = z.infer<typeof updateQuestionSchema>['body']
export type QuestionsQueryType = z.infer<typeof getQuestionsSchema>['query']
export type QuestionFilterType = z.infer<typeof questionFilterSchema>
