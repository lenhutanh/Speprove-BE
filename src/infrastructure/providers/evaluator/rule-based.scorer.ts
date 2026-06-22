import { singleton } from 'tsyringe'
import { EvaluateInput } from './llm-evaluator'

type ScoreBreakdown = {
  band: number | null
  confidence?: number
}

@singleton()
export class RuleBasedScorer {
  public pronunciation(input: EvaluateInput): ScoreBreakdown {
    const candidates = input.speechAnalysis.pronunciationCandidates ?? {}
    const scores = this._record(candidates.scores)
    const pronScore = this._number(scores?.pronScore)
    const accuracyScore = this._number(scores?.accuracyScore)
    const prosodyScore = this._number(scores?.prosodyScore)

    const availableScores = [pronScore, accuracyScore, prosodyScore].filter((score): score is number => score != null)
    if (!availableScores.length) return { band: null }

    const base100 = this._weightedAverage([
      { value: accuracyScore ?? pronScore, weight: 0.45 },
      { value: pronScore ?? accuracyScore, weight: 0.35 },
      { value: prosodyScore, weight: 0.2 }
    ])

    let band = this._score100ToPronunciationBand(base100)

    if (accuracyScore != null && pronScore != null && prosodyScore != null) {
      if (accuracyScore >= 95 && pronScore >= 90 && prosodyScore >= 80) band = Math.max(band, 8)
      else if (accuracyScore >= 90 && pronScore >= 85 && prosodyScore >= 75) band = Math.max(band, 7)
      else if (accuracyScore >= 85 && pronScore >= 80 && prosodyScore >= 70) band = Math.max(band, 7)
    }

    return {
      band: this._snapCriterionBand(band),
      confidence: this._round2(Math.min(0.95, 0.65 + availableScores.length * 0.08))
    }
  }

  private _score100ToPronunciationBand(score: number): number {
    if (score >= 95) return 9
    if (score >= 89) return 8
    if (score >= 82) return 7
    if (score >= 74) return 6
    if (score >= 64) return 5
    if (score >= 52) return 4
    if (score >= 36) return 3
    if (score >= 18) return 2
    return 1
  }

  private _weightedAverage(items: Array<{ value?: number | null; weight: number }>): number {
    const validItems = items.filter((item): item is { value: number; weight: number } => item.value != null)
    const weightSum = validItems.reduce((sum, item) => sum + item.weight, 0)
    return validItems.reduce((sum, item) => sum + item.value * item.weight, 0) / weightSum
  }

  private _snapCriterionBand(v: number): number {
    return Math.min(9, Math.max(1, Math.round(v)))
  }

  private _number(v: unknown): number | undefined {
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  }

  private _record(v: unknown): Record<string, unknown> | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  }

  private _round2(value: number): number {
    return Math.round(value * 100) / 100
  }
}
