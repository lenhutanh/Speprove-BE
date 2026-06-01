import {
  AnalysisMeta,
  Evaluation,
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
  analysisMeta?: Partial<AnalysisMeta>
  createdAt: Date
  updatedAt: Date
}

export type AttemptWordAssessmentDto = {
  wordIndex: number
  word: string
  accuracyScore?: number
  errorType?: string
  startTime?: number
  endTime?: number
  punctuationAfter?: string
  expectedIpa?: string
  spokenIpa?: string
}

export type AttemptDetailResponseDto = AttemptResponseDto & {
  transcript?: string
  evaluation?: Partial<Evaluation>
  fluencyMetrics?: Record<string, unknown>
  pronunciationScores?: Record<string, unknown>
  wordAssessments?: AttemptWordAssessmentDto[]
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
