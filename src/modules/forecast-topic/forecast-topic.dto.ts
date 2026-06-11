import { ForecastSummaryDto } from '../forecast/forecast.dto'
import { TopicSummaryDto } from '../topic/topic.dto'

export type ForecastTopicResponseDto = {
  id: string
  forecast?: ForecastSummaryDto
  order: number
  topic: TopicSummaryDto
  name: string
  slug: string
}
