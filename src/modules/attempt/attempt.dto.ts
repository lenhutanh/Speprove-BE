import {
  AnalysisMeta,
  AnalysisProviders,
  Evaluation,
  PronunciationAssessmentAnalysis,
  SpeechAnalysis,
  TranscriptionAnalysis,
  AttemptScores
} from './attempt.model'
import { AnalysisProfile } from '~/common/constants/constants'

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
  analysisProfile?: AnalysisProfile
  analysisVersion?: string
  transcriptPreview?: string
  scores?: Partial<AttemptScores>
  providers?: Partial<AnalysisProviders>
  transcription?: Partial<TranscriptionAnalysis>
  pronunciationAssessment?: Partial<PronunciationAssessmentAnalysis>
  speechAnalysis?: Partial<SpeechAnalysis>
  evaluation?: Partial<Evaluation>
  analysisMeta?: Partial<AnalysisMeta>
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
