import mongoose from 'mongoose'
import { BaseSchemaOptions } from '~/common/base'
import {
  VOCABULARY_SUGGESTION_KIND,
  VOCABULARY_SUGGESTION_LEVEL,
  VOCABULARY_SUGGESTION_SOURCE,
  VOCABULARY_SUGGESTION_STATUS
} from './vocabulary-suggestion.constants'

const vocabularySuggestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    normalizedText: { type: String, required: true, trim: true, lowercase: true },
    text: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(VOCABULARY_SUGGESTION_KIND), required: true },
    meaningVi: { type: String, required: true, trim: true },
    example: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(VOCABULARY_SUGGESTION_STATUS),
      default: VOCABULARY_SUGGESTION_STATUS.PENDING,
      index: true
    },
    source: {
      type: String,
      enum: Object.values(VOCABULARY_SUGGESTION_SOURCE),
      default: VOCABULARY_SUGGESTION_SOURCE.ADMIN,
      required: true
    },
    level: { type: String, enum: Object.values(VOCABULARY_SUGGESTION_LEVEL), required: true },
    occurrenceCount: { type: Number, default: 0, min: 0 },
    lastOccurredAt: { type: Date, default: Date.now }
  },
  BaseSchemaOptions
)

vocabularySuggestionSchema.index({ questionId: 1, normalizedText: 1 }, { unique: true })

vocabularySuggestionSchema.index({ questionId: 1, status: 1, level: 1, occurrenceCount: -1 })

export type VocabularySuggestionType = mongoose.InferSchemaType<typeof vocabularySuggestionSchema> & {
  _id: mongoose.Types.ObjectId
}

export const VocabularySuggestion =
  mongoose.models.VocabularySuggestion ||
  mongoose.model<VocabularySuggestionType>('VocabularySuggestion', vocabularySuggestionSchema)
