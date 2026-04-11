export type Syllable = {
  syllable: string
  accuracyScore: number
  offset: number
  duration: number
  isStress: boolean
  isActualStress?: boolean
}

export type WordAssessment = {
  word: string
  accuracyScore: number
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation'
  offset: number
  duration: number
  // syllables: Syllable[]
  phonemes: {
    phoneme: string
    accuracyScore: number
    offset: number
  }[]
  breakAfter?: number
}

export type PronunciationAssessmentResult = {
  transcript: string
  audioDuration: number
  speechDuration: number
  accuracyScore: number
  fluencyScore: number
  prosody: {
    score: number
    rhythm: number
    stress: number
    intonation: number
  }
  words: WordAssessment[]
}

export interface IPronunciationAssessmentProvider {
  assess(audioUrl: string, referenceText: string): Promise<PronunciationAssessmentResult>
}
