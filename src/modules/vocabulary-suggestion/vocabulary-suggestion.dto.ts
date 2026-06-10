import {
  VocabularySuggestionLevel,
  VocabularySuggestionKind,
  VocabularySuggestionSource,
  VocabularySuggestionStatus
} from './vocabulary-suggestion.constants'

export type VocabularySuggestionDto = {
  id: string
  questionId: string
  text: string
  type: VocabularySuggestionKind
  meaning: string
  example: string
  status: VocabularySuggestionStatus
  source: VocabularySuggestionSource
  level: VocabularySuggestionLevel
  occurrenceCount: number
  lastOccurredAt?: Date
  createdAt?: Date
  updatedAt?: Date
  question?: {
    id: string
    content?: string
    part?: number
  }
}

export type PublicVocabularySuggestionDto = {
  id: string
  questionId: string
  text: string
  type: VocabularySuggestionKind
  meaning: string
  example: string
  level: VocabularySuggestionLevel
}
