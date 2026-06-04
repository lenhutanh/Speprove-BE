import {
  VocabularyBandLevel,
  VocabularySuggestionKind,
  VocabularySuggestionSource,
  VocabularySuggestionStatus
} from '~/common/constants/constants'

export type VocabularySuggestionDto = {
  id: string
  questionId: string
  text: string
  type: VocabularySuggestionKind
  meaning: string
  example: string
  status: VocabularySuggestionStatus
  source: VocabularySuggestionSource
  bandLevel: VocabularyBandLevel
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
  bandLevel: VocabularyBandLevel
}
