import { singleton } from 'tsyringe'
import { AssessmentIssue } from '~/modules/attempt/attempt.model'
import { VocabularyExtractionInput } from './vocabulary-extractor.interface'

@singleton()
export class VocabularyExtractionPromptBuilder {
  public build(input: VocabularyExtractionInput): string {
    return `You are an IELTS Speaking vocabulary curator.

Extract 0 to 3 vocabulary suggestions from the transcript for Lexical Resource.
The suggestions are only candidates; an admin will review them.

Allowed types:
- word: one useful word
- phrase: reusable spoken expression, not an idiom
- idiom: fixed expression with figurative meaning

Rules:
- The item must be clearly supported by the transcript.
- Prefer reusable vocabulary, not sentence patterns or discourse markers.
- For phrases, keep the smallest expression that still sounds natural and usable by itself.
- Include necessary verbs/prepositions if they make the phrase reusable.
- Do not extract fillers, generic fragments, awkward expressions, or low-value everyday wording.
- Do not force items. Return [] if there is nothing worth learning.
- Do not extract items that overlap lexicalIssues or grammarIssues.
- Target levels: ${this.formatTargetLevels(input.targetLevels)}.
- basic = common words/phrases, safe for most learners.
- intermediate = natural collocations and topic-specific phrases.
- advanced = precise, nuanced, idiomatic, or less common expressions.

Question:
${input.question}

Transcript:
${input.transcript}

Scores:
overall: ${input.scores?.overall ?? 'unknown'}
lexical: ${input.scores?.lexical ?? 'unknown'}
grammar: ${input.scores?.grammar ?? 'unknown'}
pronunciation: ${input.scores?.pronunciation ?? 'unknown'}

Lexical issues:
${this.formatIssues(input.lexicalIssues ?? [])}

Grammar issues:
${this.formatIssues(input.grammarIssues ?? [])}

Return JSON only:
{
  "items": [
    {
      "text": "vocabulary item",
      "type": "word|phrase|idiom",
      "meaningVi": "Vietnamese meaning",
      "example": "natural IELTS Speaking sentence",
      "level": "basic|intermediate|advanced",
      "confidence": 0.85
    }
  ]
}`
  }

  private formatIssues(issues: AssessmentIssue[]) {
    if (!issues.length) return '[]'
    return JSON.stringify(
      issues.map((issue) => ({
        spanText: issue.spanText,
        suggestion: issue.suggestion,
        severity: issue.severity
      }))
    )
  }

  private formatTargetLevels(levels?: string[]) {
    return levels?.length ? levels.join(', ') : 'basic, intermediate, advanced'
  }
}
