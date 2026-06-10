import {
  VocabularySuggestionLevel,
  VocabularySuggestionKind
} from '~/modules/vocabulary-suggestion/vocabulary-suggestion.constants'
import { AssessmentIssue, AttemptScores } from '~/modules/attempt/attempt.model'

export type VocabularyExtractionInput = {
  question: string
  transcript: string
  scores?: Partial<AttemptScores>
  targetLevels?: VocabularySuggestionLevel[]
  lexicalIssues?: AssessmentIssue[]
  grammarIssues?: AssessmentIssue[]
}

export type ExtractedVocabularyItem = {
  text: string
  type: VocabularySuggestionKind
  meaningVi: string
  example: string
  level: VocabularySuggestionLevel
  confidence?: number
  reason?: string
}

export interface IVocabularyExtractor {
  extract(input: VocabularyExtractionInput): Promise<ExtractedVocabularyItem[]>
}
