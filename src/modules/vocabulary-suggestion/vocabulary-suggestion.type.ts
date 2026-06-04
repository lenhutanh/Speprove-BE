import { z } from 'zod'
import {
  approvedVocabularySuggestionQuerySchema,
  createVocabularySuggestionSchema,
  updateVocabularySuggestionSchema,
  vocabularySuggestionQuerySchema
} from './vocabulary-suggestion.validation'

export type CreateVocabularySuggestionData = z.infer<typeof createVocabularySuggestionSchema>['body']
export type UpdateVocabularySuggestionData = z.infer<typeof updateVocabularySuggestionSchema>['body']
export type VocabularySuggestionQuery = z.infer<typeof vocabularySuggestionQuerySchema>['query']
export type ApprovedVocabularySuggestionQuery = z.infer<typeof approvedVocabularySuggestionQuerySchema>['query']
