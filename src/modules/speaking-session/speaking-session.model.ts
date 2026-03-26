import mongoose from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'

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

const speakingSessionSchema = new mongoose.Schema(
  {
    ...BaseSchemaContent,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    forecastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forecast', required: true },
    mode: { type: String, enum: ['practice', 'mock'], required: true },
    // practice  → mockType: null, part: null
    // mock part → mockType: 'part', part: 1|2|3
    // mock full → mockType: 'full', part: null
    mockType: { type: String, enum: ['part', 'full'], default: null },
    part: { type: Number, enum: [1, 2, 3], default: null },
    // 0 = in_progress | 1 = completed | 2 = failed
    status: { type: Number, enum: [0, 1, 2], default: 0 },
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
