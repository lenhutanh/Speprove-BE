import { ForecastSummaryDto } from '../forecast/forecast.dto'
import { TopicSummaryDto } from '../topic/topic.dto'

type NeighborDto = { id: string; content: string }

type ForecastTopicSummaryDto = {
  id: string
  topic: TopicSummaryDto
}

type ParentDto = {
  id: string
  questionId: string
  content: string
  part: 1 | 2 | 3
  category: string
}

export type ForecastQuestionResponseDto = {
  id: string
  questionId: string
  forecast?: ForecastSummaryDto
  forecastTopic?: ForecastTopicSummaryDto | null
  order: number
  content: string
  part: 1 | 2 | 3
  bulletPoints?: string[]
  category?: string
  parent?: ParentDto
  prev?: NeighborDto | null
  next?: NeighborDto | null
  childPart3?: ForecastQuestionResponseDto[]
}
