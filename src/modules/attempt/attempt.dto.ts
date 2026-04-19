import { Evaluation, SpeechMetrics } from './attempt.model'

export type AttemptResponseDto = {
  id: string
  speakingSessionId?: string
  mode: string
  forecastQuestionId: string
  audioUrl?: string
  duration?: number
  part: number
  order: number
  status: number
  isPublic: boolean
  speechMetrics?: Partial<SpeechMetrics>
  evaluation?: Partial<Evaluation>
  createdAt: Date
  updatedAt: Date
}

export type AttemptLeaderboardDto = {
  id: string
  audioUrl?: string
  duration?: number
  transcript?: string
  scores: {
    overall: number | null
    fluency: number | null
    pronunciation: number | null
    lexical: number | null
    grammar: number | null
  }
  user: {
    id: string
    fullName: string
    avatar?: string
  } | null
  createdAt: Date
}
