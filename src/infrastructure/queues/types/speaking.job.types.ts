import { SpeechMetrics } from '~/modules/attempt/attempt.model'

export type TranscribeJobData = {
  attemptId: string
  audioUrl: string
  questionContent: string
  part: number
}

export type AssessJobData = {
  attemptId: string
  transcript: string
  audioUrl: string
  questionContent: string
  part: number
}

export type EvaluateJobData = {
  attemptId: string
  transcript: string
  questionContent: string
  speechMetrics: SpeechMetrics
  part: number
}

export type ScoreSessionJobData = {
  speakingSessionId: string
}
