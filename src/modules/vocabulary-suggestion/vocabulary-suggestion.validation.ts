import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base'
import {
  VOCABULARY_SUGGESTION_KIND,
  VOCABULARY_SUGGESTION_STATUS,
  VOCABULARY_SUGGESTION_SOURCE
} from './vocabulary-suggestion.constants'
import { objectIdSchema, requiredString } from '~/common/utils'

const vocabularyBandLevelSchema = z.coerce.number().pipe(z.union([z.literal(6), z.literal(7), z.literal(8)]))

export const createVocabularySuggestionSchema = createSchema({
  questionId: objectIdSchema,
  text: requiredString(1, 255),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND),
  meaningVi: requiredString(1, 500),
  example: requiredString(1, 500),
  bandLevel: vocabularyBandLevelSchema,
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional()
})

export const updateVocabularySuggestionSchema = updateSchema({
  text: requiredString(1, 255).optional(),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND).optional(),
  meaningVi: requiredString(1, 500).optional(),
  example: requiredString(1, 500).optional(),
  bandLevel: vocabularyBandLevelSchema.optional(),
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional()
})

export const vocabularySuggestionQuerySchema = querySchema({
  questionId: objectIdSchema.optional(),
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional(),
  source: z.nativeEnum(VOCABULARY_SUGGESTION_SOURCE).optional(),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND).optional(),
  bandLevel: vocabularyBandLevelSchema.optional()
})

export const approvedVocabularySuggestionQuerySchema = querySchema({
  questionId: objectIdSchema,
  bandLevel: vocabularyBandLevelSchema.optional()
})
