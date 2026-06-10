import { z } from 'zod'
import { createSchema, querySchema, updateSchema } from '~/common/base'
import {
  VOCABULARY_SUGGESTION_KIND,
  VOCABULARY_SUGGESTION_LEVEL,
  VOCABULARY_SUGGESTION_STATUS,
  VOCABULARY_SUGGESTION_SOURCE
} from './vocabulary-suggestion.constants'
import { objectIdSchema, requiredString } from '~/common/utils'

export const createVocabularySuggestionSchema = createSchema({
  questionId: objectIdSchema,
  text: requiredString(1, 255),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND),
  meaningVi: requiredString(1, 500),
  example: requiredString(1, 500),
  level: z.nativeEnum(VOCABULARY_SUGGESTION_LEVEL),
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional()
})

export const updateVocabularySuggestionSchema = updateSchema({
  text: requiredString(1, 255).optional(),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND).optional(),
  meaningVi: requiredString(1, 500).optional(),
  example: requiredString(1, 500).optional(),
  level: z.nativeEnum(VOCABULARY_SUGGESTION_LEVEL).optional(),
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional()
})

export const vocabularySuggestionQuerySchema = querySchema({
  questionId: objectIdSchema.optional(),
  status: z.nativeEnum(VOCABULARY_SUGGESTION_STATUS).optional(),
  source: z.nativeEnum(VOCABULARY_SUGGESTION_SOURCE).optional(),
  type: z.nativeEnum(VOCABULARY_SUGGESTION_KIND).optional(),
  level: z.nativeEnum(VOCABULARY_SUGGESTION_LEVEL).optional()
})

export const approvedVocabularySuggestionQuerySchema = querySchema({
  questionId: objectIdSchema,
  level: z.nativeEnum(VOCABULARY_SUGGESTION_LEVEL).optional()
})
