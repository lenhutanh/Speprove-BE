import { singleton } from 'tsyringe'
import {
  VocabularySuggestionLevel,
  VocabularySuggestionKind,
  VOCABULARY_SUGGESTION_LEVEL,
  VOCABULARY_SUGGESTION_KIND
} from '~/modules/vocabulary-suggestion/vocabulary-suggestion.constants'
import { ExtractedVocabularyItem } from './vocabulary-extractor.interface'

@singleton()
export class VocabularyExtractionResponseParser {
  public parse(raw: string): ExtractedVocabularyItem[] {
    const root = this.parseJsonObject(raw)
    const items = Array.isArray(root?.items) ? root.items : []

    return items
      .map((item): ExtractedVocabularyItem | null => {
        if (!item || typeof item !== 'object') return null
        const record = item as Record<string, unknown>

        const text = this.cleanString(record.text)
        const type = this.parseKind(record.type)
        const meaningVi = this.cleanString(record.meaningVi)
        const example = this.cleanString(record.example)
        const level = this.parseLevel(record.level)
        const confidence = this.parseConfidence(record.confidence)
        const reason = this.cleanString(record.reason)

        if (!text || !type || !meaningVi || !example || !level) return null

        return {
          text,
          type,
          meaningVi,
          example,
          level,
          confidence,
          reason
        }
      })
      .filter((item): item is ExtractedVocabularyItem => item != null)
  }

  private parseJsonObject(raw: string): Record<string, unknown> | null {
    const trimmed = raw.trim()

    try {
      const parsed = JSON.parse(trimmed)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
    } catch {
      const start = trimmed.indexOf('{')
      const end = trimmed.lastIndexOf('}')
      if (start === -1 || end <= start) return null

      try {
        const parsed = JSON.parse(trimmed.slice(start, end + 1))
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
      } catch {
        return null
      }
    }
  }

  private parseKind(value: unknown): VocabularySuggestionKind | null {
    return Object.values(VOCABULARY_SUGGESTION_KIND).includes(value as VocabularySuggestionKind)
      ? (value as VocabularySuggestionKind)
      : null
  }

  private parseLevel(value: unknown): VocabularySuggestionLevel | null {
    const level = typeof value === 'string' ? value.trim().toLowerCase() : ''
    return Object.values(VOCABULARY_SUGGESTION_LEVEL).includes(level as VocabularySuggestionLevel)
      ? (level as VocabularySuggestionLevel)
      : null
  }

  private parseConfidence(value: unknown): number | undefined {
    if (value == null) return undefined
    const confidence = Number(value)
    if (Number.isNaN(confidence)) return undefined
    return Math.min(1, Math.max(0, confidence))
  }

  private cleanString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ') : undefined
  }
}
