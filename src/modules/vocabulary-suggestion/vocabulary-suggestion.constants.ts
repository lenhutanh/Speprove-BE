export const VOCABULARY_SUGGESTION_KIND = {
  WORD: 'word',
  PHRASE: 'phrase',
  IDIOM: 'idiom'
} as const

export type VocabularySuggestionKind = (typeof VOCABULARY_SUGGESTION_KIND)[keyof typeof VOCABULARY_SUGGESTION_KIND]

export const VOCABULARY_SUGGESTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  HIDDEN: 'hidden'
} as const

export type VocabularySuggestionStatus =
  (typeof VOCABULARY_SUGGESTION_STATUS)[keyof typeof VOCABULARY_SUGGESTION_STATUS]

export const VOCABULARY_SUGGESTION_SOURCE = {
  ADMIN: 'admin',
  LLM: 'llm'
} as const

export type VocabularySuggestionSource =
  (typeof VOCABULARY_SUGGESTION_SOURCE)[keyof typeof VOCABULARY_SUGGESTION_SOURCE]

export const VOCABULARY_BAND_LEVEL = [6, 7, 8] as const
export type VocabularyBandLevel = (typeof VOCABULARY_BAND_LEVEL)[number]
