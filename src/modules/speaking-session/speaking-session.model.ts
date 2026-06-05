import mongoose from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'
import { SPEAKING_SESSION_TYPE } from './speaking-session.constants'

const sessionResultSchema = new mongoose.Schema(
  {
    fluency: { type: Number, default: null },
    lexical: { type: Number, default: null },
    grammar: { type: Number, default: null },
    pronunciation: { type: Number, default: null },
    overall: { type: Number, default: null }
  },
  { _id: false }
)

const sessionPart1TopicSchema = new mongoose.Schema(
  {
    forecastTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForecastTopic' },
    forecastQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForecastQuestion' }]
  },
  { _id: false }
)

const sessionQuestionSchema = new mongoose.Schema(
  {
    part1: { type: [sessionPart1TopicSchema] },
    part2: { type: mongoose.Schema.Types.ObjectId, ref: 'ForecastQuestion' },
    part3: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForecastQuestion' }]
  },
  { _id: false }
)

const speakingSessionSchema = new mongoose.Schema(
  {
    ...BaseSchemaContent,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    forecastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forecast', required: true },
    type: {
      type: String,
      enum: Object.values(SPEAKING_SESSION_TYPE),
      required: true
    },
    voiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voice', required: true },
    questions: { type: sessionQuestionSchema, required: true },
    status: { type: Number, enum: [0, 1, 2], default: 0 },
    currentQuestionIndex: { type: Number, default: 0 },
    result: { type: sessionResultSchema, default: null },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null }
  },
  BaseSchemaOptions
)

export type SpeakingSessionType = mongoose.InferSchemaType<typeof speakingSessionSchema> & {
  _id: mongoose.Types.ObjectId
}
export const SpeakingSession =
  mongoose.models.SpeakingSession || mongoose.model<SpeakingSessionType>('SpeakingSession', speakingSessionSchema)
