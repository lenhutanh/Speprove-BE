type NeighborDto = { id: string; content: string }

type ParentDto = {
  id: string
  questionId: string
  content: string
  part: 1 | 2 | 3
}

export type ForecastQuestionResponseDto = {
  id: string
  questionId: string
  order: number
  content: string
  part: 1 | 2 | 3
  bulletPoints?: string[]
  category?: string
  parent?: ParentDto
  audioUrl?: string
  prev?: NeighborDto | null
  next?: NeighborDto | null
  childPart3?: ForecastQuestionResponseDto[]
}
