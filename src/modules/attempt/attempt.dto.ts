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
  speechMetrics?: SpeechMetrics
  evaluation?: Evaluation
  createdAt: Date
  updatedAt: Date
}
