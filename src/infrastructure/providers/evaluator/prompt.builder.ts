import { LongPause, Word } from '~/modules/attempt/attempt.model'
import { PART_CONTEXT, RUBRIC } from './rubric'
import { singleton } from 'tsyringe'
import { EvaluateInput } from './llm-evaluator'

@singleton()
export class EvaluatorPromptBuilder {
  public build(input: EvaluateInput): string {
    const { question, part, speechMetrics: m } = input

    const annotatedTranscript = this._buildAnnotatedTranscript(m.words ?? [], m.longPauses ?? [])

    // ── Fluency signals ──
    const fluencySignals = {
      duration_sec: m.duration,
      speechRate_wpm: m.speechRate,
      wordCount: m.wordCount,
      totalLongPauses: m.longPauses?.length ?? 0,
      longPauses:
        m.longPauses?.map((p) => ({
          start_sec: +(p.start / 1000).toFixed(2),
          end_sec: +(p.end / 1000).toFixed(2),
          duration_sec: +p.duration.toFixed(2)
        })) ?? [],
      fillerWords: m.fillers,
      fillerCount: m.fillerCount,
      repetitions: m.repetitions,
      repetitionCount: m.repetitionCount
    }

    // ── Pronunciation signals ──
    const mispronounced = (m.words ?? [])
      .filter((w) => w.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((w) => ({
        wordIndex: w.wordIndex,
        word: w.word,
        score: w.score
      }))

    const pronunciationSignals = {
      avgPhonemeScore_0to100: m.avgPronunciationScore, // 0–100 (fixed in mapper)
      prosodyScore_0to100: m.prosodyScore ?? null, // single Azure value, no breakdown
      mispronounced
    }

    return `You are a certified IELTS Speaking examiner. Evaluate the candidate response strictly following official IELTS band descriptors (bands 0–9). Return all feedback in VIETNAMESE, EXCEPT for specific vocabulary or grammar suggestions/corrections which MUST remain in ENGLISH.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAM PART CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${PART_CONTEXT[part]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION / CUE CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDEXED & ANNOTATED TRANSCRIPT
Format: "wordIndex:word [PAUSE Xs]"
• Use these exact wordIndex numbers for grammar errors and lexical weakWords
• [PAUSE] between sentences = content hesitation | [PAUSE] mid-sentence = language search
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${annotatedTranscript}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-COMPUTED AUDIO METRICS (Azure Speech – ground truth, 0–100 scale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUENCY SIGNALS:
${JSON.stringify(fluencySignals, null, 0)}

PRONUNCIATION SIGNALS:
${JSON.stringify(pronunciationSignals, null, 0)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICIAL IELTS BAND DESCRIPTORS (0–9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${RUBRIC}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FLUENCY & COHERENCE
   • speechRate_wpm: primary speed signal. < 110 wpm → penalise. 120–180 wpm → reward (Band 7+).
   • longPauses + fillerCount + repetitionCount: PRIMARY signals for band level.
   • Classify each [PAUSE] in annotated transcript:
     - Between full sentences/ideas = content hesitation → Band 7–8
     - Mid-sentence before a content word = language search → Band 5–6
   • Part 2 only: all cue card bullet points must be covered; penalise if duration < 45s.

2. PRONUNCIATION ← FOLLOW HARD BAND FLOOR ANCHORS IN RUBRIC FIRST
   • Step 1: Look up avgPhonemeScore + prosodyScore → find the band floor anchor → that is your MINIMUM band.
   • Step 2: Adjust UP only if the delivery is exceptionally natural and sustained.
   • Step 3: Adjust DOWN only if mispronounced list has 3+ words with score < 60 AND they are clearly real errors (not STT artifacts).
   • Feedback: cite 1–2 specific words from mispronounced list (score < 70) as evidence. If all errors are STT artifacts, state that pronunciation is clean and only cite prosody.

3. LEXICAL RESOURCE
   • Evaluate range, precision, less-common vocabulary, collocations, idiomatic use, paraphrase ability.
   • weakWords MUST contain at least 1 entry if band < 8.5. At band 7–8, suggest more precise or sophisticated alternatives to good-but-common phrases — this helps the learner improve even from a strong base.
   • weakWords can be empty [] ONLY if band is 8.5 or above.
   • 'original' and 'suggestion' MUST be in English. 'reason' MUST be in Vietnamese.

4. GRAMMATICAL RANGE & ACCURACY
   • Evaluate structure range, accuracy in simple vs complex forms, error impact on communication.
   • STT artifact check: before flagging a grammar error, verify the phrase makes sense as a plausible utterance. If the transcript shows garbled words (incoherent phrase), skip — likely STT misrecognition, not a real error.
   • errors MUST contain at least 1 entry if band < 8.0. At band 7–7.5, flag subtle errors (wrong preposition, article slip, missing connective) to guide improvement.
   • errors can be empty [] ONLY if band is 8.0 or above with no noticeable errors.
   • 'original' and 'correction' MUST be in English. 'reason' MUST be in Vietnamese.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — valid JSON only, no markdown, no text outside JSON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "fluency":      { "band": <0–9, step 0.5>, "feedback": "<Vietnamese, 1–2 sentences>" },
  "pronunciation":{ "band": <0–9, step 0.5>, "feedback": "<Vietnamese, 1–2 sentences>" },
  "lexical": {
    "band": <0–9, step 0.5>,
    "feedback": "<Vietnamese, 1–2 sentences>",
    "weakWords": [{ "startWordIndex": int, "endWordIndex": int, "original": "English", "suggestion": "English", "reason": "Vietnamese" }]
  },
  "grammar": {
    "band": <0–9, step 0.5>,
    "feedback": "<Vietnamese, 1–2 sentences>",
    "errors": [{ "startWordIndex": int, "endWordIndex": int, "original": "English", "correction": "English", "reason": "Vietnamese" }]
  }
}
`
  }

  private _buildAnnotatedTranscript(words: Word[], longPauses: LongPause[]): string {
    if (!words || words.length === 0) return ''

    // Convert array pauses sang Map để tra cứu O(1) theo afterWordIndex
    const pauseMap = new Map<number, number>()
    longPauses.forEach((p) => pauseMap.set(p.afterWordIndex, p.duration))

    const parts: string[] = []

    // Xử lý khoảng lặng đầu file (nếu user im lặng trước khi nói chữ đầu tiên)
    if (pauseMap.has(-1)) {
      parts.push(`[PAUSE ${pauseMap.get(-1)!.toFixed(1)}s]`)
    }

    for (const w of words) {
      // Ép dấu câu trực tiếp vào từ để LLM thấy rõ ranh giới câu
      parts.push(`${w.wordIndex}:${w.word}${w.punctuationAfter}`)

      // Thêm [PAUSE Xs] nếu có khoảng lặng ngay sau từ này
      if (pauseMap.has(w.wordIndex)) {
        parts.push(`[PAUSE ${pauseMap.get(w.wordIndex)!.toFixed(1)}s]`)
      }
    }

    return parts.join(' ')
  }
}
