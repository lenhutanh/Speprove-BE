import mongoose from 'mongoose'
import { BaseSchemaOptions } from '~/common/base'

const analysisProviderInfoSchema = new mongoose.Schema(
  {
    name: { type: String },
    model: { type: String },
    version: { type: String },
    configVersion: { type: String },
    promptVersion: { type: String }
  },
  { _id: false }
)

const analysisProvidersSchema = new mongoose.Schema(
  {
    stt: { type: analysisProviderInfoSchema, default: null },
    pronunciation: { type: analysisProviderInfoSchema, default: null },
    evaluator: { type: analysisProviderInfoSchema, default: null }
  },
  { _id: false }
)

const transcriptionSegmentSchema = new mongoose.Schema(
  {
    index: { type: Number },
    text: { type: String },
    startTime: { type: Number },
    endTime: { type: Number },
    confidence: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
)

const transcriptionSchema = new mongoose.Schema(
  {
    sttTranscript: { type: String },
    normalizedReferenceText: { type: String },
    azureTranscript: { type: String },
    scoringTranscript: { type: String },
    confidence: { type: Number },
    segments: { type: [transcriptionSegmentSchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
)

const assessmentScoreSchema = new mongoose.Schema(
  {
    pronScore: { type: Number },
    accuracyScore: { type: Number },
    fluencyScore: { type: Number },
    completenessScore: { type: Number },
    prosodyScore: { type: Number }
  },
  { _id: false }
)

const nBestPhonemeSchema = new mongoose.Schema(
  {
    phoneme: { type: String },
    score: { type: Number },
    confidence: { type: Number }
  },
  { _id: false }
)

const assessmentPhonemeSchema = new mongoose.Schema(
  {
    phoneme: { type: String },
    expectedIpa: { type: String },
    spokenIpa: { type: String },
    accuracyScore: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
    nBestPhonemes: { type: [nBestPhonemeSchema], default: [] }
  },
  { _id: false }
)

const assessmentSyllableSchema = new mongoose.Schema(
  {
    syllable: { type: String },
    accuracyScore: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
    expectedStress: { type: Boolean },
    actualStress: { type: Boolean }
  },
  { _id: false }
)

const assessmentWordSchema = new mongoose.Schema(
  {
    wordIndex: { type: Number },
    word: { type: String },
    accuracyScore: { type: Number },
    errorType: { type: String },
    expectedIpa: { type: String },
    spokenIpa: { type: String },
    offset: { type: Number },
    duration: { type: Number },
    punctuationAfter: { type: String },
    syllables: { type: [assessmentSyllableSchema], default: [] },
    phonemes: { type: [assessmentPhonemeSchema], default: [] },
    prosodyFeedback: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
)

const pronunciationAssessmentSchema = new mongoose.Schema(
  {
    scores: { type: assessmentScoreSchema, default: {} },
    words: { type: [assessmentWordSchema], default: [] },
    prosodyFeedback: { type: mongoose.Schema.Types.Mixed },
    confidence: { type: Number },
    raw: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
)

const speechAnalysisSchema = new mongoose.Schema(
  {
    fluencyMetrics: { type: mongoose.Schema.Types.Mixed },
    pronunciationCandidates: { type: mongoose.Schema.Types.Mixed },
    transcriptMismatch: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
)

const assessmentIssueSchema = new mongoose.Schema(
  {
    spanText: { type: String },
    suggestion: { type: String },
    reason: { type: String },
    severity: { type: String, enum: ['minor', 'major'] },
    startWordIndex: { type: Number },
    endWordIndex: { type: Number },
    alignmentStatus: { type: String, enum: ['aligned', 'unmatched', 'not_applicable'] },
    alignmentConfidence: { type: Number }
  },
  { _id: false }
)

const simpleCriterionEvaluationSchema = new mongoose.Schema(
  {
    band: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    limitations: { type: [String], default: [] },
    confidence: { type: Number }
  },
  { _id: false }
)

const issueCriterionEvaluationSchema = new mongoose.Schema(
  {
    band: { type: Number, default: null },
    issues: { type: [assessmentIssueSchema], default: [] },
    strengths: { type: [String], default: [] },
    limitations: { type: [String], default: [] },
    confidence: { type: Number }
  },
  { _id: false }
)

const evaluationSchema = new mongoose.Schema(
  {
    fluency: { type: simpleCriterionEvaluationSchema, default: null },
    pronunciation: { type: simpleCriterionEvaluationSchema, default: null },
    lexical: { type: issueCriterionEvaluationSchema, default: null },
    grammar: { type: issueCriterionEvaluationSchema, default: null },
    overall: { type: Number, default: null },
    confidence: { type: Number },
    alignmentConfidence: { type: Number }
  },
  { _id: false }
)

const attemptAnalysisSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      unique: true,
      index: true
    },
    providers: { type: analysisProvidersSchema, default: {} },
    transcription: { type: transcriptionSchema, default: {} },
    pronunciationAssessment: { type: pronunciationAssessmentSchema, default: {} },
    speechAnalysis: { type: speechAnalysisSchema, default: {} },
    evaluation: { type: evaluationSchema, default: {} }
  },
  BaseSchemaOptions
)

export type AnalysisProviderInfo = {
  name?: string
  model?: string
  version?: string
  configVersion?: string
  promptVersion?: string
}

export type AnalysisProviders = {
  stt?: AnalysisProviderInfo | null
  pronunciation?: AnalysisProviderInfo | null
  evaluator?: AnalysisProviderInfo | null
}

export type TranscriptionSegment = {
  index?: number
  text?: string
  startTime?: number
  endTime?: number
  confidence?: number
  metadata?: Record<string, unknown>
}

export type TranscriptionAnalysis = {
  sttTranscript?: string
  normalizedReferenceText?: string
  azureTranscript?: string
  scoringTranscript?: string
  confidence?: number
  segments?: TranscriptionSegment[]
  metadata?: Record<string, unknown>
}

export type AnalysisToken = {
  index: number
  text: string
  normalizedText?: string
  startTime?: number
  endTime?: number
  sentenceIndex?: number
  source?: 'stt' | 'azure' | 'merged'
}

export type AssessmentScores = {
  pronScore?: number
  accuracyScore?: number
  fluencyScore?: number
  completenessScore?: number
  prosodyScore?: number
}

export type NBestPhoneme = {
  phoneme: string
  score?: number
  confidence?: number
}

export type AssessmentPhoneme = {
  phoneme?: string
  expectedIpa?: string
  spokenIpa?: string
  accuracyScore?: number
  offset?: number
  duration?: number
  nBestPhonemes?: NBestPhoneme[]
}

export type AssessmentSyllable = {
  syllable?: string
  accuracyScore?: number
  offset?: number
  duration?: number
  expectedStress?: boolean
  actualStress?: boolean
}

export type AssessmentWord = {
  wordIndex: number
  word: string
  accuracyScore?: number
  errorType?: string
  expectedIpa?: string
  spokenIpa?: string
  offset?: number
  duration?: number
  punctuationAfter?: string
  syllables?: AssessmentSyllable[]
  phonemes?: AssessmentPhoneme[]
  prosodyFeedback?: Record<string, unknown>
}

export type PronunciationAssessmentAnalysis = {
  scores?: AssessmentScores
  words?: AssessmentWord[]
  prosodyFeedback?: Record<string, unknown>
  confidence?: number
  raw?: Record<string, unknown>
}

export type FluencyPause = {
  startTime: number
  endTime: number
  duration: number
  afterWordIndex: number
}

export type FluencyMetrics = {
  duration?: number
  speechDuration?: number
  wordCount?: number
  speechRate?: number
  articulationRate?: number
  pauseCount?: number
  longPauseCount?: number
  totalPauseDuration?: number
  pauseRatio?: number
  meanLengthOfRun?: number
  pauses?: FluencyPause[]
}

export type SpeechAnalysis = {
  fluencyMetrics?: Partial<FluencyMetrics>
  pronunciationCandidates?: Record<string, unknown>
  transcriptMismatch?: Record<string, unknown>
}

export type AssessmentIssue = {
  spanText?: string
  suggestion?: string
  reason: string
  severity: 'minor' | 'major'
  startWordIndex?: number
  endWordIndex?: number
  alignmentStatus?: 'aligned' | 'unmatched' | 'not_applicable'
  alignmentConfidence?: number
}

export type SimpleCriterionEvaluation = {
  band: number | null
  strengths?: string[] | null
  limitations?: string[] | null
  confidence?: number
}

export type IssueCriterionEvaluation = {
  band: number | null
  issues: AssessmentIssue[]
  strengths?: string[] | null
  limitations?: string[] | null
  confidence?: number
}

export type Evaluation = {
  fluency?: SimpleCriterionEvaluation | null
  pronunciation?: SimpleCriterionEvaluation | null
  lexical?: IssueCriterionEvaluation | null
  grammar?: IssueCriterionEvaluation | null
  overall?: number | null
  confidence?: number
  alignmentConfidence?: number
}

type RawAttemptAnalysisType = mongoose.InferSchemaType<typeof attemptAnalysisSchema>

export type AttemptAnalysisType = Omit<
  RawAttemptAnalysisType,
  'providers' | 'transcription' | 'pronunciationAssessment' | 'speechAnalysis' | 'evaluation'
> & {
  _id: mongoose.Types.ObjectId
  attemptId: mongoose.Types.ObjectId
  providers?: Partial<AnalysisProviders>
  transcription?: Partial<TranscriptionAnalysis>
  pronunciationAssessment?: Partial<PronunciationAssessmentAnalysis>
  speechAnalysis?: Partial<SpeechAnalysis>
  evaluation?: Partial<Evaluation>
}

export const AttemptAnalysis =
  mongoose.models.AttemptAnalysis || mongoose.model<AttemptAnalysisType>('AttemptAnalysis', attemptAnalysisSchema)
