import { singleton } from 'tsyringe'
import { PronunciationAssessmentResult } from '~/infrastructure/providers/speech-assessment/assessment.interface'
import { LongPause, SpeechMetrics, Word } from './attempt.model'
import { toIpa } from '~/common/utils/phonetic.util'

const FILLERS = new Set(['uh', 'um', 'er', 'ah', 'hmm'])
const LONG_PAUSE_THRESHOLD = 0.5

const cleanWord = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '')

@singleton()
export class SpeechMapper {
  toSpeechMetrics(result: PronunciationAssessmentResult): SpeechMetrics {
    const { words, speechDuration, audioDuration } = result

    const enrichedWords = this._enrichWords(words, result.transcript)

    const scorableWords = enrichedWords.filter((w) => w.isScoreable)
    const wordCount = scorableWords.length

    const speechRate = speechDuration > 0 ? Math.round((wordCount / (speechDuration / 60)) * 10) / 10 : 0

    const allPauses: LongPause[] = words
      .map((w, index) => ({ w, index }))
      .filter(({ w }) => w.breakAfter != null && w.breakAfter > 0)
      .map(({ w, index }) => ({
        start: w.offset + w.duration,
        end: w.offset + w.duration + w.breakAfter!,
        duration: w.breakAfter!,
        afterWordIndex: index
      }))

    const fillerWords = enrichedWords.filter((w) => w.isFiller).map((w) => cleanWord(w.word))

    const repetitions: string[] = []
    for (let i = 1; i < enrichedWords.length; i++) {
      const cur = cleanWord(enrichedWords[i].word)
      const prev = cleanWord(enrichedWords[i - 1].word)
      if (cur === prev && !FILLERS.has(cur) && cur.length > 0) {
        repetitions.push(cur)
      }
    }

    return {
      duration: audioDuration,
      wordCount,
      speechRate,
      pauseCount: allPauses.length,
      longPauses: allPauses.filter((p) => p.duration >= LONG_PAUSE_THRESHOLD),
      fillerCount: fillerWords.length,
      fillers: [...new Set(fillerWords)],
      repetitionCount: repetitions.length,
      repetitions: [...new Set(repetitions)],
      avgPronunciationScore: Math.round(result.accuracyScore),
      prosodyScore: result.prosody?.score ?? null, // Flatten object
      words: enrichedWords
    }
  }

  private _enrichWords(words: PronunciationAssessmentResult['words'], transcript: string): Word[] {
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
      while (charCursor < transcript.length && /[\s,\.?!;:"'\-]/.test(transcript[charCursor])) {
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
      const afterMatch = transcript.slice(charCursor).match(/^([,\.?!;:"'\-]*)/)
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
      const mappedPhonemes = (w.phonemes ?? []).map((p: any) => {
        const ipa = toIpa(p.phoneme)
        spokenIpa += ipa
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
}
