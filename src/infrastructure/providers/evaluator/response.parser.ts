import { singleton } from 'tsyringe'
import { AnalysisToken, AssessmentIssue, AssessmentWord, Evaluation } from '~/modules/attempt/attempt.model'
import { EvaluateInput, EvaluatorOutput } from './llm-evaluator'
import { RuleBasedScorer } from './rule-based.scorer'

type NormalizedToken = AnalysisToken & {
  normalizedText: string
}

type AlignmentResult = {
  startWordIndex?: number
  endWordIndex?: number
  status: NonNullable<AssessmentIssue['alignmentStatus']>
  confidence?: number
}

type ParsedCriterion = {
  band: number | null
  issues: AssessmentIssue[]
  strengths: string[]
  limitations: string[]
  confidence?: number
}

@singleton()
export class EvaluatorResponseParser {
  constructor(private readonly ruleBasedScorer: RuleBasedScorer) {}

  public parse(raw: string, input: EvaluateInput): EvaluatorOutput {
    const parsed = this._parseJson(raw)
    const root = this._asRecord(parsed)
    const warnings: string[] = []

    if (!root) warnings.push('LLM_EVALUATOR_INVALID_JSON')

    const fluency = this._parseCriterion(root?.fluency, 0)
    const lexical = this._parseCriterion(root?.lexical, 4)
    const grammar = this._parseCriterion(root?.grammar, 4)

    if (fluency.band == null) warnings.push('LLM_EVALUATOR_MISSING_FLUENCY_BAND')
    if (lexical.band == null) warnings.push('LLM_EVALUATOR_MISSING_LEXICAL_BAND')
    if (grammar.band == null) warnings.push('LLM_EVALUATOR_MISSING_GRAMMAR_BAND')

    const pronunciation = this.ruleBasedScorer.pronunciation(input)
    const pronunciationBand = pronunciation.band
    const fluencyBand = fluency.band

    if (pronunciationBand == null) warnings.push('RULE_BASED_PRONUNCIATION_BAND_UNAVAILABLE')

    const evaluation: Evaluation = {
      fluency: {
        band: fluencyBand,
        strengths: fluency.strengths,
        limitations: fluency.limitations,
        confidence: fluency.confidence
      },
      pronunciation: {
        band: pronunciationBand,
        confidence: pronunciation.confidence
      },
      lexical: {
        band: lexical.band,
        issues: lexical.issues,
        strengths: lexical.strengths,
        limitations: lexical.limitations,
        confidence: lexical.confidence
      },
      grammar: {
        band: grammar.band,
        issues: grammar.issues,
        strengths: grammar.strengths,
        limitations: grammar.limitations,
        confidence: grammar.confidence
      }
    }

    evaluation.overall = this._calculateOverall(evaluation)
    evaluation.confidence = this._averageConfidence(evaluation)

    const alignmentTokens = this._tokensFromWords(input.assessmentWords)
    const alignmentWarnings = this._alignEvaluation(evaluation, alignmentTokens)
    warnings.push(...alignmentWarnings)

    const isValid =
      evaluation.fluency?.band != null &&
      evaluation.pronunciation?.band != null &&
      evaluation.lexical?.band != null &&
      evaluation.grammar?.band != null

    return {
      evaluation,
      warnings,
      isValid
    }
  }

  private _parseCriterion(value: unknown, maxIssues: number): ParsedCriterion {
    const record = this._asRecord(value)
    if (!record) return { band: null, issues: [], strengths: [], limitations: [] }

    return {
      band: this._snapCriterionBand(record.band),
      issues: this._parseIssues(record.issues, maxIssues),
      strengths: this._parseStringArray(record.strengths),
      limitations: this._parseStringArray(record.limitations),
      confidence: this._confidence(record.confidence)
    }
  }

  private _parseStringArray(v: unknown): string[] {
    if (Array.isArray(v)) {
      return v.map((item) => String(item).trim()).filter(Boolean)
    }
    if (typeof v === 'string' && v.trim().length > 0) {
      return [v.trim()]
    }
    return []
  }

  private _parseIssues(value: unknown, maxIssues: number): AssessmentIssue[] {
    if (!Array.isArray(value)) return []

    return value
      .slice(0, maxIssues)
      .map((item): AssessmentIssue | null => {
        const record = this._asRecord(item) ?? {}
        const reason = this._cleanString(record.reason)
        if (!reason) return null

        const issue: AssessmentIssue = {
          reason,
          severity: this._severity(record.severity)
        }

        const spanText = this._cleanString(record.spanText)
        const suggestion = this._cleanString(record.suggestion)
        if (spanText) issue.spanText = spanText
        if (suggestion) issue.suggestion = suggestion

        return issue
      })
      .filter((item): item is AssessmentIssue => item != null)
  }

  private _alignEvaluation(evaluation: Evaluation, tokens: AnalysisToken[] | undefined): string[] {
    const normalizedTokens = this._normalizeTokens(tokens ?? [])
    const warnings: string[] = []
    const alignmentConfidences: number[] = []

    const issueGroups = [evaluation.lexical?.issues, evaluation.grammar?.issues].filter(
      (issues): issues is AssessmentIssue[] => Array.isArray(issues)
    )

    for (const issues of issueGroups) {
      for (const issue of issues) {
        const alignment = this._alignIssue(issue, normalizedTokens)
        issue.startWordIndex = alignment.startWordIndex
        issue.endWordIndex = alignment.endWordIndex
        issue.alignmentStatus = alignment.status
        issue.alignmentConfidence = alignment.confidence

        if (alignment.confidence != null) alignmentConfidences.push(alignment.confidence)
        if (alignment.status === 'unmatched') warnings.push(`ALIGNMENT_UNMATCHED_${issue.spanText}`)
      }
    }

    if (alignmentConfidences.length > 0) {
      evaluation.alignmentConfidence = this._round2(
        alignmentConfidences.reduce((sum, confidence) => sum + confidence, 0) / alignmentConfidences.length
      )
    }

    return warnings
  }

  private _alignIssue(issue: AssessmentIssue, tokens: NormalizedToken[]): AlignmentResult {
    const spanTokens = this._tokenize(issue.spanText ?? '')
    if (!spanTokens.length) return { status: 'not_applicable' }
    if (!tokens.length) return { status: 'unmatched', confidence: 0 }

    const exact = this._findExactSpan(spanTokens, tokens)
    if (exact) return { ...exact, status: 'aligned', confidence: 0.95 }

    const fuzzy = this._findFuzzySpan(spanTokens, tokens)
    if (fuzzy) return fuzzy

    return { status: 'unmatched', confidence: 0 }
  }

  private _calculateOverall(evaluation: Evaluation): number | null {
    const bands = [
      evaluation.fluency?.band,
      evaluation.pronunciation?.band,
      evaluation.lexical?.band,
      evaluation.grammar?.band
    ].filter((band): band is number => band != null)

    return bands.length === 4 ? this._snapOverallBand(bands.reduce((sum, band) => sum + band, 0) / bands.length) : null
  }

  private _averageConfidence(evaluation: Evaluation): number | undefined {
    const values = [
      evaluation.fluency?.confidence,
      evaluation.pronunciation?.confidence,
      evaluation.lexical?.confidence,
      evaluation.grammar?.confidence
    ].filter((value): value is number => typeof value === 'number')

    return values.length ? this._round2(values.reduce((sum, value) => sum + value, 0) / values.length) : undefined
  }

  private _findExactSpan(
    spanTokens: string[],
    tokens: NormalizedToken[]
  ): Pick<AlignmentResult, 'startWordIndex' | 'endWordIndex'> | null {
    for (let start = 0; start <= tokens.length - spanTokens.length; start++) {
      const window = tokens.slice(start, start + spanTokens.length).map((token) => token.normalizedText)
      if (this._arraysEqual(spanTokens, window)) {
        return {
          startWordIndex: tokens[start].index,
          endWordIndex: tokens[start + spanTokens.length - 1].index
        }
      }
    }

    return null
  }

  private _findFuzzySpan(spanTokens: string[], tokens: NormalizedToken[]): AlignmentResult | null {
    let best: AlignmentResult | null = null
    const minWindowSize = Math.max(1, spanTokens.length - 2)
    const maxWindowSize = Math.min(tokens.length, spanTokens.length + 2)

    for (let windowSize = minWindowSize; windowSize <= maxWindowSize; windowSize++) {
      for (let start = 0; start <= tokens.length - windowSize; start++) {
        const window = tokens.slice(start, start + windowSize)
        const similarity = this._tokenSimilarity(
          spanTokens,
          window.map((token) => token.normalizedText)
        )

        if (
          !best ||
          (similarity > (best.confidence ?? 0) && similarity >= this._alignmentThreshold(spanTokens.length))
        ) {
          best = {
            startWordIndex: window[0].index,
            endWordIndex: window[window.length - 1].index,
            status: 'aligned',
            confidence: this._round2(Math.min(0.85, similarity))
          }
        }
      }
    }

    return best
  }

  private _normalizeTokens(tokens: AnalysisToken[]): NormalizedToken[] {
    return tokens
      .filter((token) => typeof token.index === 'number' && token.text)
      .map((token) => ({
        ...token,
        normalizedText: this._tokenize(token.normalizedText || token.text)[0] ?? ''
      }))
      .filter((token) => token.normalizedText.length > 0)
  }

  private _tokensFromWords(words: AssessmentWord[] | undefined): AnalysisToken[] | undefined {
    if (!Array.isArray(words) || words.length === 0) return undefined

    return words
      .filter((word) => typeof word.wordIndex === 'number' && word.word)
      .map((word) => ({
        index: word.wordIndex,
        text: word.word,
        normalizedText: this._tokenize(word.word)[0] ?? '',
        startTime: word.offset,
        endTime:
          typeof word.offset === 'number' && typeof word.duration === 'number'
            ? word.offset + word.duration
            : undefined,
        source: 'azure' as const
      }))
  }

  private _tokenSimilarity(a: string[], b: string[]): number {
    const denominator = Math.max(a.length, b.length, 1)
    return this._round2(Math.max(0, 1 - this._levenshtein(a, b) / denominator))
  }

  private _alignmentThreshold(spanLength: number): number {
    if (spanLength <= 2) return 0.8
    if (spanLength <= 5) return 0.7
    return 0.65
  }

  private _parseJson(raw: string): unknown | null {
    const trimmed = raw.trim()

    try {
      return JSON.parse(trimmed)
    } catch {
      const withoutFence = trimmed
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim()
      try {
        return JSON.parse(withoutFence)
      } catch {
        const start = withoutFence.indexOf('{')
        const end = withoutFence.lastIndexOf('}')
        if (start === -1 || end === -1 || end <= start) return null

        try {
          return JSON.parse(withoutFence.slice(start, end + 1))
        } catch {
          return null
        }
      }
    }
  }

  private _snapCriterionBand(v: unknown): number | null {
    const n = Number(v)
    if (Number.isNaN(n)) return null
    return Math.min(9, Math.max(1, Math.round(n)))
  }

  private _snapOverallBand(v: unknown): number | null {
    const n = Number(v)
    if (Number.isNaN(n)) return null
    return Math.min(9, Math.max(1, Math.round(n * 2) / 2))
  }

  private _confidence(v: unknown): number | undefined {
    const n = Number(v)
    if (Number.isNaN(n)) return undefined
    return Math.min(1, Math.max(0, n))
  }

  private _cleanString(v: unknown): string | undefined {
    return typeof v === 'string' && v.trim().length ? v.trim() : undefined
  }

  private _severity(v: unknown): 'minor' | 'major' {
    if (v === 'minor' || v === 'low') return 'minor'
    if (v === 'major' || v === 'medium' || v === 'high') return 'major'
    return 'major'
  }

  private _asRecord(v: unknown): Record<string, unknown> | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  }

  private _tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  }

  private _arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  private _levenshtein(a: string[], b: string[]): number {
    const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))

    for (let i = 0; i <= a.length; i++) dp[i][0] = i
    for (let j = 0; j <= b.length; j++) dp[0][j] = j

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      }
    }

    return dp[a.length][b.length]
  }

  private _round2(value: number): number {
    return Math.round(value * 100) / 100
  }
}
