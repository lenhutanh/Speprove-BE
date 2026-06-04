import { VocabularyBandLevel, VocabularySuggestionKind } from '~/common/constants/constants'
import { AssessmentIssue, AttemptScores } from '~/modules/attempt/attempt.model'

export type VocabularyExtractionInput = {
  question: string
  transcript: string
  scores?: Partial<AttemptScores>
  targetBandLevels?: VocabularyBandLevel[]
  lexicalIssues?: AssessmentIssue[]
  grammarIssues?: AssessmentIssue[]
}

export type ExtractedVocabularyItem = {
  text: string
  type: VocabularySuggestionKind
  meaningVi: string
  example: string
  bandLevel: VocabularyBandLevel
  confidence?: number
  reason?: string
}

export interface IVocabularyExtractor {
  extract(input: VocabularyExtractionInput): Promise<ExtractedVocabularyItem[]>
}
