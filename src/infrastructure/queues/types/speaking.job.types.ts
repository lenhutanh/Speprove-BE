import { SpeechAnalysis } from '~/modules/attempt/attempt.model'

export type TranscribeJobData = {
  attemptId: string
  audioUrl: string
  questionContent: string
  part: number
}

export type AssessJobData = {
  attemptId: string
  transcript: string
  referenceTranscript?: string
  audioUrl: string
  questionContent: string
  part: number
}

export type EvaluateJobData = {
  attemptId: string
  transcript: string
  questionContent: string
  speechAnalysis: SpeechAnalysis
  part: number
}

export type ScoreSessionJobData = {
  speakingSessionId: string
}

export type ExtractVocabularyJobData = {
  attemptId: string
}
