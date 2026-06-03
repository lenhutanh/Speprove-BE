import { singleton } from 'tsyringe'
import { PronunciationAssessmentResult } from '~/infrastructure/providers/speech-assessment/assessment.interface'
import { SpeechAnalysis } from './attempt.model'

const FILLERS = new Set(['uh', 'um', 'er', 'ah', 'hmm'])
const LONG_PAUSE_THRESHOLD = 0.5
const LOW_WORD_SCORE_THRESHOLD = 75
const LOW_PHONEME_SCORE_THRESHOLD = 70

const cleanWord = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '')

type LongPause = {
  start: number
  end: number
  duration: number
  afterWordIndex: number
}

type EnrichedWord = {
  wordIndex: number
  word: string
  sentenceIndex: number
  punctuationAfter: string
  isFiller: boolean
  isRepetition: boolean
  isScoreable: boolean
  errorType: string
  score: number
  offset: number
  duration: number
  phonemes: { sound: string; score: number }[]
  spokenIpa: string
}

type DisplayTranscript = {
  words: PronunciationAssessmentResult['words']
  transcript: string
}

type PunctuatedToken = {
  normalizedText: string
  punctuationAfter: string
}

@singleton()
export class SpeechMapper {
  buildScoringTranscript(words: PronunciationAssessmentResult['words']): string {
    return this._renderDisplayTranscript(words)
  }

  buildDisplayTranscript(
    words: PronunciationAssessmentResult['words'],
    punctuationSourceTranscript: string
  ): DisplayTranscript {
    const punctuationByIndex = this._alignPunctuation(words, punctuationSourceTranscript)
    const displayWords = words.map((word) => ({
      ...word,
      punctuationAfter: punctuationByIndex.get(word.wordIndex) ?? ''
    }))

    return {
      words: displayWords,
      transcript: this._renderDisplayTranscript(displayWords)
    }
  }

  toSpeechAnalysis(
    result: PronunciationAssessmentResult,
    referenceTranscript?: string,
    _questionContent?: string,
    _part?: number
  ): SpeechAnalysis {
    const enrichedWords = this._enrichWords(result.words, result.transcript)
    const scoreableWords = enrichedWords.filter((w) => w.isScoreable)
    const wordCount = scoreableWords.length

    const pauses = this._extractPauses(result.words)
    const longPauses = pauses.filter((p) => p.duration >= LONG_PAUSE_THRESHOLD)
    const totalPauseDuration = pauses.reduce((sum, p) => sum + p.duration, 0)
    const speechDuration = result.speechDuration || 0
    const speechRate = speechDuration > 0 ? this._round1(wordCount / (speechDuration / 60)) : 0
    const articulationDuration = Math.max(0, speechDuration - totalPauseDuration)
    const articulationRate = articulationDuration > 0 ? this._round1(wordCount / (articulationDuration / 60)) : 0

    const fillerWords = enrichedWords.filter((w) => w.isFiller).map((w) => cleanWord(w.word))
    const repetitions = this._detectRepetitions(enrichedWords)

    const fluencyMetrics = {
      duration: result.audioDuration,
      speechDuration,
      wordCount,
      speechRate,
      articulationRate,
      pauseCount: pauses.length,
      longPauseCount: longPauses.length,
      totalPauseDuration: this._round2(totalPauseDuration),
      pauseRatio: speechDuration > 0 ? this._round2(totalPauseDuration / speechDuration) : 0,
      meanLengthOfRun: this._round1(this._meanLengthOfRun(enrichedWords, longPauses)),
      pauses: pauses.map((pause) => ({
        startTime: this._round2(pause.start),
        endTime: this._round2(pause.end),
        duration: this._round2(pause.duration),
        afterWordIndex: pause.afterWordIndex
      })),
      fillerCount: fillerWords.length,
      fillers: [...new Set(fillerWords)],
      repetitionCount: repetitions.length,
      repetitions: [...new Set(repetitions)],
      selfCorrectionCandidates: this._detectSelfCorrectionCandidates(result.transcript)
    }

    const lowScoreWords = result.words
      .filter((w) => w.accuracyScore < LOW_WORD_SCORE_THRESHOLD)
      .sort((a, b) => a.accuracyScore - b.accuracyScore)
      .slice(0, 10)
      .map((w) => ({
        wordIndex: w.wordIndex,
        word: w.word,
        score: Math.round(w.accuracyScore),
        errorType: w.errorType,
        expectedIpa: w.expectedIpa,
        spokenIpa: w.spokenIpa,
        startTime: w.offset,
        endTime: w.offset + w.duration
      }))

    const phonemeErrors = result.words
      .flatMap((w) =>
        (w.phonemes ?? [])
          .filter((p) => this._isFeedbackWorthyPhonemeError(p))
          .map((p) => ({
            wordIndex: w.wordIndex,
            word: w.word,
            phoneme: p.phoneme,
            expectedIpa: p.expectedIpa,
            spokenIpa: this._selectSpokenPhoneme(p),
            score: Math.round(p.accuracyScore),
            nBestPhonemes: p.nBestPhonemes
          }))
      )
      .sort((a, b) => a.score - b.score)
      .slice(0, 15)

    const breakIssues = result.words
      .filter((w) => this._hasBreakIssue(w.breakAfter, w.prosodyFeedback))
      .map((w) => ({
        wordIndex: w.wordIndex,
        word: w.word,
        breakAfter: w.breakAfter,
        breakErrorTypes: this._breakErrorTypes(w.prosodyFeedback)
      }))
      .slice(0, 10)

    const pronunciationCandidates = {
      scores: {
        pronScore: result.pronunciationScore,
        accuracyScore: result.accuracyScore,
        completenessScore: result.completenessScore,
        fluencyScore: result.fluencyScore,
        prosodyScore: result.prosody?.score
      },
      lowScoreWords,
      phonemeErrors,
      breakIssues
    }

    const transcriptMismatch = this._compareTranscripts(referenceTranscript ?? '', result.transcript)

    return {
      fluencyMetrics,
      pronunciationCandidates,
      transcriptMismatch
    }
  }

  private _enrichWords(words: PronunciationAssessmentResult['words'], transcript: string): EnrichedWord[] {
    // Bước 1: Tính Sentence Boundaries bằng Regex
    const sentenceBoundaries: { start: number; end: number }[] = []
    const sentenceRegex = /[^.!?]+[.!?]*/g
    let match
    while ((match = sentenceRegex.exec(transcript)) !== null) {
      sentenceBoundaries.push({
        start: match.index,
        end: match.index + match[0].length
      })
    }
    // Fallback nếu chuỗi không có dấu câu
    if (sentenceBoundaries.length === 0) {
      sentenceBoundaries.push({ start: 0, end: transcript.length })
    }

    // Bước 2: Quét tuần tự 2-Pointer tìm vị trí chính xác
    let charCursor = 0
    const wordPositions: { charStart: number; punctuationAfter: string }[] = []

    for (const w of words) {
      // Dọn dẹp khoảng trắng và dấu câu dư thừa trước từ hiện tại
      while (charCursor < transcript.length && /[\s,.?!;:"'-]/.test(transcript[charCursor])) {
        charCursor++
      }

      // Fuzzy match trong window nhỏ (±5 chars) để chống cascade lỗi
      const wordLower = w.word.toLowerCase()
      const transcriptSlice = transcript.slice(charCursor, charCursor + wordLower.length + 5)
      const localIdx = transcriptSlice.toLowerCase().indexOf(wordLower)

      const charStart = localIdx !== -1 ? charCursor + localIdx : charCursor

      // Đẩy cursor đi qua từ vừa quét
      charCursor = charStart + w.word.length

      // Quét dấu câu ngay sau từ
      const afterMatch = transcript.slice(charCursor).match(/^([,.?!;:"'-]*)/)
      const punctuationAfter = afterMatch?.[1] ?? ''

      // Đẩy cursor đi qua dấu câu
      charCursor += punctuationAfter.length

      wordPositions.push({ charStart, punctuationAfter })
    }

    // Bước 3: Map sang Domain Model (Word)
    return words.map((w, wordIndex) => {
      const { charStart, punctuationAfter } = wordPositions[wordIndex]
      const clean = cleanWord(w.word)

      // Tìm câu chứa ký tự bắt đầu của từ
      const sentenceIndex = sentenceBoundaries.findIndex((b) => charStart >= b.start && charStart < b.end)

      const isFiller = FILLERS.has(clean)
      const isRepetition = wordIndex > 0 && cleanWord(words[wordIndex - 1].word) === clean && !isFiller
      const isOmission = w.errorType === 'Omission'

      // Xử lý Phonemes & nối chuỗi IPA
      let spokenIpa = ''
      const mappedPhonemes = (w.phonemes ?? []).map((p) => {
        const ipa = p.expectedIpa ?? p.phoneme ?? ''
        const spokenSound = this._selectSpokenPhoneme(p)
        spokenIpa += spokenSound
        return {
          sound: ipa,
          score: Math.round(p.accuracyScore)
        }
      })

      return {
        wordIndex,
        word: w.word,
        sentenceIndex: sentenceIndex === -1 ? 0 : sentenceIndex,
        punctuationAfter,
        isFiller,
        isRepetition,
        isScoreable: !isFiller && !isRepetition && !isOmission,
        errorType: w.errorType,
        score: Math.round(w.accuracyScore),
        offset: w.offset,
        duration: w.duration,
        phonemes: mappedPhonemes,
        spokenIpa
      }
    })
  }

  private _extractPauses(words: PronunciationAssessmentResult['words']): LongPause[] {
    const pauses: LongPause[] = []

    for (let index = 0; index < words.length - 1; index++) {
      const current = words[index]
      const next = words[index + 1]
      const currentEnd = current.offset + current.duration
      const duration = next.offset - currentEnd

      if (duration <= 0) continue

      pauses.push({
        start: currentEnd,
        end: next.offset,
        duration,
        afterWordIndex: current.wordIndex
      })
    }

    return pauses
  }

  private _detectRepetitions(words: EnrichedWord[]): string[] {
    const repetitions: string[] = []

    for (let i = 1; i < words.length; i++) {
      const cur = cleanWord(words[i].word)
      const prev = cleanWord(words[i - 1].word)
      if (cur === prev && !FILLERS.has(cur) && cur.length > 0) {
        repetitions.push(cur)
      }
    }

    return repetitions
  }

  private _meanLengthOfRun(words: EnrichedWord[], longPauses: LongPause[]): number {
    const scoreableWords = words.filter((w) => w.isScoreable)
    if (scoreableWords.length === 0) return 0
    if (longPauses.length === 0) return scoreableWords.length

    const pauseIndexes = new Set(longPauses.map((p) => p.afterWordIndex))
    const runLengths: number[] = []
    let currentRun = 0

    for (const word of words) {
      if (word.isScoreable) currentRun++
      if (pauseIndexes.has(word.wordIndex)) {
        if (currentRun > 0) runLengths.push(currentRun)
        currentRun = 0
      }
    }

    if (currentRun > 0) runLengths.push(currentRun)
    return runLengths.length > 0 ? runLengths.reduce((sum, len) => sum + len, 0) / runLengths.length : 0
  }

  private _detectSelfCorrectionCandidates(transcript: string): string[] {
    const patterns = [/\bi mean\b/gi, /\bi mean to say\b/gi, /\bor rather\b/gi, /\bsorry\b/gi, /\bactually\b/gi]

    return patterns.flatMap((pattern) => transcript.match(pattern) ?? []).map((match) => match.toLowerCase())
  }

  private _hasBreakIssue(breakAfter: number | undefined, prosodyFeedback: unknown): boolean {
    if ((breakAfter ?? 0) >= LONG_PAUSE_THRESHOLD) return true

    const errorTypes = this._breakErrorTypes(prosodyFeedback)
    return errorTypes.some((type) => type !== 'None')
  }

  private _breakErrorTypes(prosodyFeedback: unknown): string[] {
    const record = this._record(prosodyFeedback)
    const breakRecord = this._record(record?.Break)
    const errorTypes = breakRecord?.ErrorTypes

    return Array.isArray(errorTypes) ? errorTypes.filter((item): item is string => typeof item === 'string') : []
  }

  private _isFeedbackWorthyPhonemeError(
    phoneme: NonNullable<PronunciationAssessmentResult['words'][number]['phonemes']>[number]
  ): boolean {
    if (phoneme.accuracyScore >= LOW_PHONEME_SCORE_THRESHOLD) return false

    const expected = phoneme.expectedIpa ?? phoneme.phoneme ?? ''
    const spoken = this._selectSpokenPhoneme(phoneme)

    return expected !== spoken
  }

  private _selectSpokenPhoneme(
    phoneme: NonNullable<PronunciationAssessmentResult['words'][number]['phonemes']>[number]
  ): string {
    const expected = phoneme.expectedIpa ?? phoneme.phoneme ?? ''
    const candidates = phoneme.nBestPhonemes ?? []
    if (!candidates.length) return phoneme.spokenIpa ?? expected

    const scores = candidates
      .map((candidate) => candidate.score)
      .filter((score): score is number => typeof score === 'number')
    if (!scores.length) return phoneme.spokenIpa ?? candidates[0].phoneme ?? expected

    const topScore = Math.max(...scores)
    const topCandidates = candidates.filter((candidate) => candidate.score === topScore)
    const expectedTopCandidate = topCandidates.find((candidate) => candidate.phoneme === expected)

    return expectedTopCandidate?.phoneme || topCandidates[0]?.phoneme || phoneme.spokenIpa || expected
  }

  private _compareTranscripts(referenceTranscript: string, assessmentTranscript: string) {
    const referenceTokens = this._tokenize(referenceTranscript)
    const providerTokens = this._tokenize(assessmentTranscript)
    const distance = this._levenshtein(referenceTokens, providerTokens)
    const denominator = Math.max(referenceTokens.length, providerTokens.length, 1)
    const mismatchRate = distance / denominator

    return {
      referenceWordCount: referenceTokens.length,
      providerWordCount: providerTokens.length,
      editDistance: distance,
      mismatchRate: this._round2(mismatchRate),
      confidence: this._round2(Math.max(0, 1 - mismatchRate))
    }
  }

  private _tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  }

  private _alignPunctuation(
    words: PronunciationAssessmentResult['words'],
    punctuationSourceTranscript: string
  ): Map<number, string> {
    const sourceTokens = this._tokenizeWithPunctuation(punctuationSourceTranscript)
    const sourceWords = sourceTokens.map((token) => token.normalizedText)
    const assessmentWords = words.map((word) => cleanWord(word.word))
    const alignedSourceIndexes = this._alignTokenIndexes(assessmentWords, sourceWords)
    const punctuationByIndex = new Map<number, string>()

    words.forEach((word, index) => {
      const sourceIndex = alignedSourceIndexes[index]
      if (sourceIndex == null) return

      const punctuationAfter = sourceTokens[sourceIndex]?.punctuationAfter
      if (punctuationAfter) punctuationByIndex.set(word.wordIndex, punctuationAfter)
    })

    return punctuationByIndex
  }

  private _tokenizeWithPunctuation(text: string): PunctuatedToken[] {
    const tokens: PunctuatedToken[] = []
    const matches = text.matchAll(/[a-zA-Z0-9']+|[.,?!;:]+/g)

    for (const match of matches) {
      const value = match[0]

      if (/^[a-zA-Z0-9']+$/.test(value)) {
        tokens.push({
          normalizedText: cleanWord(value),
          punctuationAfter: ''
        })
        continue
      }

      if (tokens.length > 0) {
        const previous = tokens[tokens.length - 1]
        previous.punctuationAfter = `${previous.punctuationAfter}${value}`
      }
    }

    return tokens.filter((token) => token.normalizedText.length > 0)
  }

  private _alignTokenIndexes(assessmentWords: string[], sourceWords: string[]): Array<number | undefined> {
    const dp = Array.from({ length: assessmentWords.length + 1 }, () =>
      new Array<number>(sourceWords.length + 1).fill(0)
    )

    for (let i = assessmentWords.length; i >= 0; i--) dp[i][sourceWords.length] = assessmentWords.length - i
    for (let j = sourceWords.length; j >= 0; j--) dp[assessmentWords.length][j] = sourceWords.length - j

    for (let i = assessmentWords.length - 1; i >= 0; i--) {
      for (let j = sourceWords.length - 1; j >= 0; j--) {
        const substitutionCost = assessmentWords[i] === sourceWords[j] ? 0 : 1
        dp[i][j] = Math.min(substitutionCost + dp[i + 1][j + 1], 1 + dp[i + 1][j], 1 + dp[i][j + 1])
      }
    }

    const alignedSourceIndexes: Array<number | undefined> = []
    let i = 0
    let j = 0

    while (i < assessmentWords.length && j < sourceWords.length) {
      const substitutionCost = assessmentWords[i] === sourceWords[j] ? 0 : 1

      if (dp[i][j] === substitutionCost + dp[i + 1][j + 1]) {
        if (substitutionCost === 0) alignedSourceIndexes[i] = j
        i++
        j++
        continue
      }

      if (dp[i][j] === 1 + dp[i + 1][j]) {
        i++
        continue
      }

      j++
    }

    return alignedSourceIndexes
  }

  private _renderDisplayTranscript(words: PronunciationAssessmentResult['words']): string {
    return words
      .map((word) => `${word.word}${word.punctuationAfter ?? ''}`)
      .join(' ')
      .replace(/\s+([.,?!;:])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private _record(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
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

  private _round1(value: number): number {
    return Math.round(value * 10) / 10
  }

  private _round2(value: number): number {
    return Math.round(value * 100) / 100
  }
}
