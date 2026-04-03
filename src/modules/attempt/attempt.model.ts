import mongoose from 'mongoose'
import { BaseSchemaOptions } from '~/common/base'
import { SPEAKING_SESSION_MODE } from '~/common/constants/constants'

const pauseSchema = new mongoose.Schema(
  {
    start: Number,
    end: Number,
    duration: Number
  },
  { _id: false }
)

const wordSchema = new mongoose.Schema(
  {
    wordIndex: Number,
    word: String,
    score: Number,
    offset: Number,
    duration: Number,
    phonemes: [{ sound: String, score: Number }],
    spokenIpa: { type: String, default: '' },
    expectedIpa: { type: String, default: '' }
  },
  { _id: false }
)

const speechMetricsSchema = new mongoose.Schema(
  {
    duration: { type: Number },
    wordCount: { type: Number },
    speechRate: { type: Number },
    pauseCount: { type: Number },
    longPauses: { type: [pauseSchema], default: [] },
    fillerCount: { type: Number },
    fillers: { type: [String], default: [] },
    repetitionCount: { type: Number },
    repetitions: { type: [String], default: [] },
    avgPronunciationScore: { type: Number },
    prosody: {
      score: { type: Number }
    },
    transcriptTokens: { type: [String], default: [] },
    words: { type: [wordSchema], default: [] }
  },
  { _id: false }
)

const criterionSchema = new mongoose.Schema(
  {
    band: { type: Number },
    feedback: { type: String }
  },
  { _id: false }
)

const lexicalWeakWordSchema = new mongoose.Schema(
  {
    startWordIndex: { type: Number },
    endWordIndex: { type: Number },
    original: { type: String },
    suggestion: { type: String },
    reason: { type: String }
  },
  { _id: false }
)

const grammarErrorSchema = new mongoose.Schema(
  {
    startWordIndex: { type: Number },
    endWordIndex: { type: Number },
    original: { type: String },
    correction: { type: String },
    reason: { type: String }
  },
  { _id: false }
)

const evaluationSchema = new mongoose.Schema(
  {
    transcript: { type: String },

    fluency: {
      type: criterionSchema,
      default: null
    },

    pronunciation: {
      type: criterionSchema,
      default: null
    },

    lexical: {
      band: { type: Number, default: null },
      feedback: { type: String },
      weakWords: { type: [lexicalWeakWordSchema], default: [] }
    },

    grammar: {
      band: { type: Number, default: null },
      feedback: { type: String },
      errors: { type: [grammarErrorSchema], default: [] }
    },

    overall: { type: Number, default: null }
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
    speechMetrics: { type: speechMetricsSchema, default: {} },
    evaluation: { type: evaluationSchema, default: {} }
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

attemptSchema.index({ userId: 1, forecastQuestionId: 1, createdAt: -1 })

export type PhonemeInfo = {
  sound: string
  score: number
}

export type Word = {
  wordIndex: number
  word: string
  score: number
  offset: number
  duration: number
  phonemes: PhonemeInfo[]
  spokenIpa: string
  expectedIpa: string
}

export type SpeechMetrics = {
  duration: number
  wordCount: number
  speechRate: number
  pauseCount: number
  longPauses: { start: number; end: number; duration: number }[]
  fillerCount: number
  fillers: string[]
  repetitionCount: number
  repetitions: string[]
  avgPronunciationScore: number
  prosody: {
    score: number
  }
  transcriptTokens: string[]
  words: Word[]
}

export type LexicalWeakWord = {
  startWordIndex: number
  endWordIndex: number
  original: string
  suggestion: string
  reason: string
}

export type GrammarError = {
  startWordIndex: number
  endWordIndex: number
  original: string
  correction: string
  reason: string
}

export type Evaluation = {
  transcript: string
  fluency: {
    band: number
    feedback: string
  } | null
  pronunciation: {
    band: number
    feedback: string
  } | null
  lexical: {
    band: number
    feedback: string
    weakWords: LexicalWeakWord[]
  } | null
  grammar: {
    band: number
    feedback: string
    errors: GrammarError[]
  } | null
  overall: number | null
}

type RawAttemptType = mongoose.InferSchemaType<typeof attemptSchema>

export type AttemptType = Omit<RawAttemptType, 'speechMetrics' | 'evaluation'> & {
  _id: mongoose.Types.ObjectId
  speechMetrics: SpeechMetrics | any
  evaluation: Evaluation | any
}

export const Attempt = mongoose.models.Attempt || mongoose.model<AttemptType>('Attempt', attemptSchema)
