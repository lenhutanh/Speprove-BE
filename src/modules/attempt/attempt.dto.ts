import { AnalysisMeta, Evaluation, AttemptScores, FluencyMetrics } from './attempt.model'
import { AnalysisProfile } from './attempt.constants'
import { ForecastQuestionResponseDto } from '../forecast-question/forecast-question.dto'

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
  question?: ForecastQuestionResponseDto
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
  phonemes?: AttemptPhonemeAssessmentDto[]
}

export type AttemptPhonemeAssessmentDto = {
  phoneme?: string
  expectedIpa?: string
  spokenIpa?: string
  accuracyScore?: number
}

export type AttemptDetailResponseDto = AttemptResponseDto & {
  transcript?: string
  evaluation?: Partial<Evaluation>
  fluencyMetrics?: Partial<FluencyMetrics>
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
