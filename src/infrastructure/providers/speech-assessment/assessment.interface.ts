export type Syllable = {
  syllable: string
  accuracyScore: number
  offset: number
  duration: number
  expectedStress?: boolean
  actualStress?: boolean
}

export type NBestPhoneme = {
  phoneme: string
  score?: number
  confidence?: number
}

export type PhonemeAssessment = {
  phoneme: string
  expectedIpa?: string
  spokenIpa?: string
  accuracyScore: number
  offset: number
  duration?: number
  nBestPhonemes: NBestPhoneme[]
}

export type WordAssessment = {
  wordIndex: number
  word: string
  accuracyScore: number
  errorType: string
  expectedIpa?: string
  spokenIpa?: string
  offset: number
  duration: number
  punctuationAfter?: string
  syllables: Syllable[]
  phonemes: PhonemeAssessment[]
  breakAfter?: number
  prosodyFeedback?: Record<string, unknown>
}

export type PronunciationAssessmentResult = {
  transcript: string
  audioDuration: number
  speechDuration: number
  pronunciationScore: number
  accuracyScore: number
  completenessScore: number
  fluencyScore: number
  prosody: {
    score: number
    rhythm: number
    stress: number
    intonation: number
    feedback?: Record<string, unknown>
  }
  words: WordAssessment[]
  raw?: Record<string, unknown>
}

export interface IPronunciationAssessmentProvider {
  assess(audioUrl: string, referenceText: string): Promise<PronunciationAssessmentResult>
}
