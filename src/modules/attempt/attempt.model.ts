import mongoose from 'mongoose'
import { BaseSchemaOptions } from '~/common/base'
import { ANALYSIS_PROFILE, AnalysisProfile, SPEAKING_SESSION_MODE } from '~/common/constants/constants'

export {
  AnalysisProviderInfo,
  AnalysisProviders,
  AnalysisToken,
  AssessmentIssue,
  AssessmentPhoneme,
  AssessmentScores,
  AssessmentSyllable,
  AssessmentWord,
  AttemptAnalysisType,
  Evaluation,
  FluencyMetrics,
  FluencyPause,
  FluencyEvaluation,
  IssueCriterionEvaluation,
  NBestPhoneme,
  PronunciationAssessmentAnalysis,
  SpeechAnalysis,
  SimpleCriterionEvaluation,
  TranscriptionAnalysis,
  TranscriptionSegment
} from './attempt-analysis.model'

const attemptScoresSchema = new mongoose.Schema(
  {
    overall: { type: Number, default: null },
    fluency: { type: Number, default: null },
    pronunciation: { type: Number, default: null },
    lexical: { type: Number, default: null },
    grammar: { type: Number, default: null }
  },
  { _id: false }
)

const analysisMetaSchema = new mongoose.Schema(
  {
    startedAt: { type: Date },
    finishedAt: { type: Date },
    currentStage: { type: String, enum: ['transcribe', 'assess', 'evaluate', 'score_session'] },
    failedStage: { type: String, enum: ['transcribe', 'assess', 'evaluate', 'score_session'] },
    error: { type: String },
    warnings: { type: [String], default: [] }
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true
    },
    mode: { type: String, enum: Object.values(SPEAKING_SESSION_MODE), required: true },
    speakingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
      default: null
    },
    forecastQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForecastQuestion',
      required: true
    },
    audioFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null
    },
    part: { type: Number, enum: [1, 2, 3], required: true },
    order: { type: Number, required: true },
    status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    analysisProfile: {
      type: String,
      enum: Object.values(ANALYSIS_PROFILE),
      default: ANALYSIS_PROFILE.STANDARD,
      index: true
    },
    analysisVersion: {
      type: String,
      default: 'v1'
    },
    transcriptPreview: { type: String },
    duration: { type: Number },
    scores: { type: attemptScoresSchema, default: {} },
    analysisMeta: { type: analysisMetaSchema, default: {} }
  },
  BaseSchemaOptions
)

attemptSchema.index(
  { speakingSessionId: 1, order: 1 },
  {
    unique: true,
    partialFilterExpression: { speakingSessionId: { $type: 'objectId' } }
  }
)

attemptSchema.index(
  { speakingSessionId: 1, forecastQuestionId: 1 },
  {
    unique: true,
    partialFilterExpression: { speakingSessionId: { $type: 'objectId' } }
  }
)

attemptSchema.index({ userId: 1, forecastQuestionId: 1, createdAt: -1 })
attemptSchema.index({ forecastQuestionId: 1, status: 1, isPublic: 1, 'scores.overall': -1 })

export type AttemptScores = {
  overall?: number | null
  fluency?: number | null
  pronunciation?: number | null
  lexical?: number | null
  grammar?: number | null
}

export type AnalysisMeta = {
  startedAt?: Date
  finishedAt?: Date
  currentStage?: 'transcribe' | 'assess' | 'evaluate' | 'score_session'
  failedStage?: 'transcribe' | 'assess' | 'evaluate' | 'score_session'
  error?: string
  warnings?: string[]
}

type RawAttemptType = mongoose.InferSchemaType<typeof attemptSchema>

export type AttemptType = Omit<RawAttemptType, 'analysisProfile' | 'scores' | 'analysisMeta'> & {
  _id: mongoose.Types.ObjectId
  analysisProfile?: AnalysisProfile
  scores?: Partial<AttemptScores>
  analysisMeta?: Partial<AnalysisMeta>
}

export const Attempt = mongoose.models.Attempt || mongoose.model<AttemptType>('Attempt', attemptSchema)
