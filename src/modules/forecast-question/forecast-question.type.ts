import z from 'zod'
import { forecastQuestionQuerySchema } from './forecast-question.validation'

export type ForecastQuestionQueryType = z.infer<typeof forecastQuestionQuerySchema>['query']
