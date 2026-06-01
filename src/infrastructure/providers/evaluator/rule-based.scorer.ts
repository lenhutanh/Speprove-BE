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
    const completenessScore = this._number(scores?.completenessScore)

    const availableScores = [pronScore, accuracyScore, prosodyScore].filter((score): score is number => score != null)
    if (!availableScores.length) return { band: null }

    const base100 = this._weightedAverage([
      { value: accuracyScore ?? pronScore, weight: 0.45 },
      { value: pronScore ?? accuracyScore, weight: 0.35 },
      { value: prosodyScore, weight: 0.2 }
    ])

    let band = this._score100ToPronunciationBand(base100)

    const lowScoreWords = Array.isArray(candidates.lowScoreWords) ? candidates.lowScoreWords : []
    const phonemeErrors = Array.isArray(candidates.phonemeErrors) ? candidates.phonemeErrors : []
    const breakIssues = Array.isArray(candidates.breakIssues) ? candidates.breakIssues : []

    const severeWordCount = lowScoreWords.filter((item) => (this._number(this._record(item)?.score) ?? 100) < 55).length
    const verySevereWordCount = lowScoreWords.filter(
      (item) => (this._number(this._record(item)?.score) ?? 100) < 40
    ).length

    if (completenessScore != null) {
      if (completenessScore < 30) band = Math.min(band, 3)
      else if (completenessScore < 50) band = Math.min(band, 4)
      else if (completenessScore < 65) band = Math.min(band, 5)
    }

    if (verySevereWordCount >= 3) band = Math.min(band, 5)
    else if (verySevereWordCount >= 1) band = Math.min(band, 6)

    if (severeWordCount >= 7) band = Math.min(band, 5)
    else if (severeWordCount >= 4) band = Math.min(band, 6)

    if (phonemeErrors.length >= 15) band = Math.min(band, 5)
    else if (phonemeErrors.length >= 10) band = Math.min(band, 6)

    if (breakIssues.length >= 5) band = Math.min(band, 6)

    if (accuracyScore != null && pronScore != null && prosodyScore != null) {
      if (accuracyScore >= 95 && pronScore >= 90 && prosodyScore >= 80) band = Math.max(band, 8)
      else if (accuracyScore >= 90 && pronScore >= 85 && prosodyScore >= 75) band = Math.max(band, 7)
      else if (accuracyScore >= 85 && pronScore >= 80 && prosodyScore >= 70) band = Math.max(band, 7)
    }

    return {
      band: this._snapCriterionBand(band),
      confidence: this._round2(Math.min(0.95, 0.65 + availableScores.length * 0.08 + lowScoreWords.length * 0.005))
    }
  }

  public delivery(input: EvaluateInput): ScoreBreakdown {
    const candidates = input.speechAnalysis.pronunciationCandidates ?? {}
    const scores = this._record(candidates.scores)
    const azureFluencyScore = this._number(scores?.fluencyScore)

    const metrics = input.speechAnalysis.fluencyMetrics ?? {}
    const speechRate = this._number(metrics.speechRate)
    const pauseRatio = this._number(metrics.pauseRatio)
    const meanLengthOfRun = this._number(metrics.meanLengthOfRun)
    const fillerCount = this._number(metrics.fillerCount) ?? 0
    const repetitionCount = this._number(metrics.repetitionCount) ?? 0
    const longPauseCount = this._number(metrics.longPauseCount) ?? 0
    const wordCount = this._number(metrics.wordCount) ?? 0
    const speechDuration = this._number(metrics.speechDuration) ?? this._number(metrics.duration) ?? 0

    if (wordCount <= 2 || speechDuration < 3) {
      return { band: 2, confidence: 0.9 }
    }

    const subMetricBands = [
      { value: speechRate == null ? null : this._speechRateBand(speechRate), weight: 0.25 },
      { value: pauseRatio == null ? null : this._pauseRatioBand(pauseRatio), weight: 0.3 },
      { value: meanLengthOfRun == null ? null : this._meanLengthOfRunBand(meanLengthOfRun), weight: 0.2 },
      { value: this._disfluencyBand(fillerCount), weight: 0.15 },
      { value: this._repetitionBand(repetitionCount), weight: 0.1 }
    ]
    const knownSubBands = subMetricBands.filter((item) => item.value != null)

    let band: number
    if (azureFluencyScore != null && knownSubBands.length > 0) {
      const azureBand = this._score100ToFluencyBand(azureFluencyScore)
      const subMetricBand = this._weightedAverage(knownSubBands)
      band = azureBand * 0.6 + subMetricBand * 0.4
    } else if (azureFluencyScore != null) {
      band = this._score100ToFluencyBand(azureFluencyScore)
    } else if (knownSubBands.length > 0) {
      band = this._weightedAverage(knownSubBands)
    } else {
      return { band: null }
    }

    if (wordCount < 8 || speechDuration < 8) band = Math.min(band, 4)

    const durationBand = this._durationBand(input.part, speechDuration, wordCount)
    if (durationBand < band) band = band * 0.7 + durationBand * 0.3

    if (input.part === 2 && speechDuration > 0 && speechDuration < 30) band = Math.min(band, 5)
    else if (input.part === 2 && speechDuration > 0 && speechDuration < 45) band = Math.min(band, 6)
    if (input.part === 3 && speechDuration > 0 && speechDuration < 20) band = Math.min(band, 6)

    if (longPauseCount >= 10) band = Math.min(band, 4)
    else if (longPauseCount >= 7) band = Math.min(band, 5)
    else if (longPauseCount >= 4) band = Math.min(band, 6)

    if (pauseRatio != null && pauseRatio >= 0.55) band = Math.min(band, 4)
    else if (pauseRatio != null && pauseRatio >= 0.4) band = Math.min(band, 5)

    if (meanLengthOfRun != null && meanLengthOfRun < 2) band = Math.min(band, 4)

    return {
      band: this._snapCriterionBand(band),
      confidence: this._round2(
        Math.min(0.95, 0.5 + (azureFluencyScore != null ? 0.25 : 0) + knownSubBands.length * 0.04)
      )
    }
  }

  public combineFluency(deliveryBand: number, coherenceBand: number): number {
    const average = deliveryBand * 0.55 + coherenceBand * 0.45
    const lowerBand = Math.min(deliveryBand, coherenceBand)
    return this._snapCriterionBand(Math.min(average, lowerBand + 1))
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

  private _score100ToFluencyBand(score: number): number {
    if (score >= 95) return 9
    if (score >= 88) return 8
    if (score >= 80) return 7
    if (score >= 70) return 6
    if (score >= 58) return 5
    if (score >= 44) return 4
    if (score >= 28) return 3
    if (score >= 12) return 2
    return 1
  }

  private _speechRateBand(speechRate: number): number {
    if (speechRate >= 125 && speechRate <= 165) return 8
    if ((speechRate >= 110 && speechRate < 125) || (speechRate > 165 && speechRate <= 180)) return 7
    if ((speechRate >= 95 && speechRate < 110) || (speechRate > 180 && speechRate <= 200)) return 6
    if ((speechRate >= 75 && speechRate < 95) || (speechRate > 200 && speechRate <= 220)) return 5
    if (speechRate >= 50 && speechRate < 75) return 4
    return 3
  }

  private _pauseRatioBand(pauseRatio: number): number {
    if (pauseRatio <= 0.06) return 8
    if (pauseRatio <= 0.12) return 7
    if (pauseRatio <= 0.2) return 6
    if (pauseRatio <= 0.3) return 5
    if (pauseRatio <= 0.42) return 4
    if (pauseRatio <= 0.58) return 3
    return 2
  }

  private _meanLengthOfRunBand(meanLengthOfRun: number): number {
    if (meanLengthOfRun >= 12) return 8
    if (meanLengthOfRun >= 8) return 7
    if (meanLengthOfRun >= 6) return 6
    if (meanLengthOfRun >= 4) return 5
    if (meanLengthOfRun >= 3) return 4
    if (meanLengthOfRun >= 2) return 3
    return 2
  }

  private _disfluencyBand(count: number): number {
    if (count <= 1) return 8
    if (count <= 3) return 7
    if (count <= 6) return 6
    if (count <= 10) return 5
    if (count <= 15) return 4
    return 3
  }

  private _repetitionBand(count: number): number {
    if (count <= 2) return 8
    if (count <= 5) return 7
    if (count <= 9) return 6
    if (count <= 14) return 5
    return 4
  }

  private _durationBand(part: number, speechDuration: number, wordCount: number): number {
    if (speechDuration <= 0 || wordCount <= 0) return 1

    if (part === 1) {
      if (speechDuration >= 10 && speechDuration <= 35 && wordCount >= 15) return 8
      if (speechDuration >= 7 && wordCount >= 8) return 6
      return 4
    }

    if (part === 2) {
      if (speechDuration >= 90 && wordCount >= 130) return 8
      if (speechDuration >= 60 && wordCount >= 80) return 7
      if (speechDuration >= 45 && wordCount >= 55) return 6
      if (speechDuration >= 25 && wordCount >= 30) return 5
      return 3
    }

    if (speechDuration >= 35 && wordCount >= 55) return 8
    if (speechDuration >= 25 && wordCount >= 35) return 7
    if (speechDuration >= 18 && wordCount >= 22) return 6
    if (speechDuration >= 10 && wordCount >= 12) return 5
    return 3
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
