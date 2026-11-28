export type QuestionResponseDto = {
  id: string
  content: string
  part: number
  status: number
  topicId: string | any
  category?: string
  bulletPoints?: string[]
  parentId?: string | any
  createdAt?: Date
  updatedAt?: Date
}
