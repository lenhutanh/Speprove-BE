import mongoose from 'mongoose'
import { BaseSchemaOptions } from '~/common/base'

const pauseSchema = new mongoose.Schema(
  {
    start: Number,
    end: Number,
    duration: Number
  },
  { _id: false }
)

const speechMetricsSchema = new mongoose.Schema(
  {
    duration: { type: Number }, // second
    wordCount: { type: Number },
    speechRate: { type: Number }, // words/minute
    pauseCount: { type: Number },
    longPauses: { type: [pauseSchema], default: [] }, // pause > 1s
    fillerCount: { type: Number },
    fillers: { type: [String], default: [] }, // ['uh','um',...]
    repetitionCount: { type: Number },
    repetitions: { type: [String], default: [] },
    avgPronunciationScore: { type: Number }, // 0–1
    weakWords: {
      type: [
        {
          word: String,
          score: Number, // 0–1
          spoken: String, // IPA thực tế
          expected: String // IPA chuẩn
        }
      ],
      default: []
    }
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
    word: String,
    suggestion: String
  },
  { _id: false }
)

const grammarErrorSchema = new mongoose.Schema(
  {
    phrase: String, // "it make me"
    correction: String, // "it makes me"
    type: String // "subject-verb agreement"
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
      // highlight dùng speechMetrics.weakWords trực tiếp, không lưu lại ở đây
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

    overall: { type: Number, default: null } // avg 4 criteria, round 0.5
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    speakingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
      required: true
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

    partNumber: { type: Number, enum: [1, 2, 3], default: null }, // dùng khi tính full test
    order: { type: Number, required: true }, // thứ tự câu trong session, bắt đầu từ 1

    // pending → processing → done | failed
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
      index: true
    },

    speechMetrics: { type: speechMetricsSchema, default: null },
    evaluation: { type: evaluationSchema, default: null }
  },
  BaseSchemaOptions
)

attemptSchema.index({ speakingSessionId: 1, order: 1 }, { unique: true })

export type AttemptType = mongoose.InferSchemaType<typeof attemptSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Attempt = mongoose.models.Attempt || mongoose.model<AttemptType>('Attempt', attemptSchema)
