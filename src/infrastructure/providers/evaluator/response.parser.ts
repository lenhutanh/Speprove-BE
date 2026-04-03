import { singleton } from 'tsyringe'
import { Evaluation } from '~/modules/attempt/attempt.model'
import { EvaluateInput } from './llm-evaluator'

@singleton()
export class EvaluatorResponseParser {
  public parse(raw: string, input: EvaluateInput): Evaluation {
    const { transcript, speechMetrics: m } = input
    const maxIdx = Math.max(0, (m.transcriptTokens?.length ?? 1) - 1)

    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      return this._fallback(transcript)
    }

    const snapBand = (v: unknown): number | null => {
      const n = Number(v)
      if (isNaN(n)) return null
      return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
    }

    const parseHighlight = (item: any) => {
      const start = this.clampIndex(item.startWordIndex, maxIdx)
      const end = this.clampIndex(item.endWordIndex, maxIdx)
      return {
        startWordIndex: Math.min(start, end),
        endWordIndex: Math.max(start, end)
      }
    }

    const fluencyBand = snapBand(parsed.fluency?.band)
    const pronunciationBand = snapBand(parsed.pronunciation?.band)
    const lexicalBand = snapBand(parsed.lexical?.band)
    const grammarBand = snapBand(parsed.grammar?.band)

    const bands = [fluencyBand, pronunciationBand, lexicalBand, grammarBand].filter((b): b is number => b !== null)

    const overall = bands.length ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2 : null

    return {
      transcript,

      fluency: fluencyBand !== null ? { band: fluencyBand, feedback: String(parsed.fluency?.feedback ?? '') } : null,

      pronunciation:
        pronunciationBand !== null
          ? { band: pronunciationBand, feedback: String(parsed.pronunciation?.feedback ?? '') }
          : null,

      lexical:
        lexicalBand !== null
          ? {
              band: lexicalBand,
              feedback: String(parsed.lexical?.feedback ?? ''),
              weakWords: Array.isArray(parsed.lexical?.weakWords)
                ? parsed.lexical.weakWords.map((w: any) => ({
                    ...parseHighlight(w),
                    original: String(w.original ?? ''),
                    suggestion: String(w.suggestion ?? ''),
                    reason: String(w.reason ?? '')
                  }))
                : []
            }
          : null,

      grammar:
        grammarBand !== null
          ? {
              band: grammarBand,
              feedback: String(parsed.grammar?.feedback ?? ''),
              errors: Array.isArray(parsed.grammar?.errors)
                ? parsed.grammar.errors.map((e: any) => ({
                    ...parseHighlight(e),
                    original: String(e.original ?? ''),
                    correction: String(e.correction ?? ''),
                    reason: String(e.reason ?? '')
                  }))
                : []
            }
          : null,

      overall
    }
  }

  private _fallback(transcript: string): Evaluation {
    return { transcript, fluency: null, pronunciation: null, lexical: null, grammar: null, overall: null }
  }

  private clampIndex(v: unknown, max: number): number {
    const n = Number(v)
    if (isNaN(n)) return 0
    return Math.max(0, Math.min(max, Math.floor(n)))
  }
}
