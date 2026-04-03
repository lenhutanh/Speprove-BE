import { singleton } from 'tsyringe'
import { PronunciationAssessmentResult } from '~/infrastructure/providers/speech-assessment/assessment.interface'
import { SpeechMetrics } from './attempt.model'
import { toIpa } from '~/common/utils/phonetic.util'

const FILLERS = new Set(['uh', 'um', 'er', 'ah', 'hmm'])
const MISPRONOUNCED_THRESHOLD = 80
const LONG_PAUSE_THRESHOLD = 0.5

const cleanWord = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '')

@singleton()
export class SpeechMapper {
  toSpeechMetrics(result: PronunciationAssessmentResult): SpeechMetrics {
    const { words, speechDuration, audioDuration } = result

    const transcriptTokens = words.map((w) => w.word)

    const detailedWords = words.map((w, wordIndex) => {
      const expectedStressedOffset = w.syllables?.find((s) => s.isStress)?.offset
      const actualStressedOffset = w.syllables?.find((s) => s.isActualStress)?.offset

      let spokenFullIpa = ''

      const mappedPhonemes = (w.phonemes ?? []).map((p: any) => {
        const ipa = toIpa(p.phoneme)
        const isActualStress = p.offset === actualStressedOffset
        const isExpectedStress = p.offset === expectedStressedOffset

        if (isActualStress) spokenFullIpa += `ˈ${ipa}`
        else spokenFullIpa += ipa

        return {
          sound: ipa,
          score: Math.round(p.accuracyScore),
          isStress: isExpectedStress,
          isActualStress: isActualStress
        }
      })

      return {
        wordIndex,
        word: w.word,
        score: Math.round(w.accuracyScore),
        offset: w.offset,
        duration: w.duration,
        phonemes: mappedPhonemes,
        spokenIpa: spokenFullIpa,
        expectedIpa: '',
        isMispronounced: w.accuracyScore < MISPRONOUNCED_THRESHOLD,
        syllables: w.syllables
      }
    })

    const scorableWords = words.filter((w) => !FILLERS.has(cleanWord(w.word)))
    const wordCount = scorableWords.length
    const speechRate = speechDuration > 0 ? Math.round((wordCount / (speechDuration / 60)) * 10) / 10 : 0

    const allPauses = words
      .filter((w) => w.breakAfter != null && w.breakAfter > 0)
      .map((w) => ({
        start: w.offset + w.duration,
        end: w.offset + w.duration + w.breakAfter!,
        duration: w.breakAfter!
      }))

    const longPauses = allPauses.filter((p) => p.duration >= LONG_PAUSE_THRESHOLD)

    const fillerWords = words.filter((w) => FILLERS.has(cleanWord(w.word))).map((w) => cleanWord(w.word))

    const repetitions: string[] = []
    for (let i = 1; i < words.length; i++) {
      const cur = cleanWord(words[i].word)
      const prev = cleanWord(words[i - 1].word)
      if (cur === prev && !FILLERS.has(cur) && cur.length > 0) {
        repetitions.push(cur)
      }
    }

    return {
      duration: audioDuration,
      wordCount,
      speechRate,
      pauseCount: allPauses.length,
      longPauses,
      fillerCount: fillerWords.length,
      fillers: [...new Set(fillerWords)],
      repetitionCount: repetitions.length,
      repetitions: [...new Set(repetitions)],
      avgPronunciationScore: Math.round(result.accuracyScore),
      prosody: {
        score: result.prosody?.score ?? null
      },
      transcriptTokens,
      words: detailedWords
    }
  }
}
