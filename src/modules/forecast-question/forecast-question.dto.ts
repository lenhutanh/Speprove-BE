export type ForecastQuestionResponseDto = {
  id: string
  forecastTopicId: string
  questionId: string
  order: number
  content: string
  part: 1 | 2 | 3
  bulletPoints?: string[]
  part2Content?: string
}
