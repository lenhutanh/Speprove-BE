import z from 'zod'
import { forecastTopicQuerySchema } from './forecast-topic.validation'

export type ForecastTopicQueryType = z.infer<typeof forecastTopicQuerySchema>['query']
