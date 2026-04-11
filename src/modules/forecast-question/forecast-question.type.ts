import z from 'zod'
import { forecastQuestionQuerySchema, getAttemptsOfQuestionSchema } from './forecast-question.validation'

export type ForecastQuestionQueryType = z.infer<typeof forecastQuestionQuerySchema>['query']

export type GetAttemptsOfQuestionType = z.infer<typeof getAttemptsOfQuestionSchema>['query']
