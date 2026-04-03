// import Groq from 'groq-sdk'
// import { SpeechMetrics, Evaluation } from '../attempt/attempt.model'

// // ─── Types ────────────────────────────────────────────────────────────────────

// export type EvaluateInput = {
//   transcript: string
//   question: string // Part 2: đã format "topic\n- bullet1\n- bullet2..."
//   part: 1 | 2 | 3
//   speechMetrics: SpeechMetrics
// }

// // ─── Part context (exam format + expectations) ────────────────────────────────

// const PART_CONTEXT: Record<number, string> = {
//   1: `IELTS Speaking Part 1 – Introduction & Interview (4–5 min total).
// Format: Short personal questions on familiar topics (family, hobbies, work, daily life).
// Expected response length: 2–4 sentences per question. Brevity is APPROPRIATE – do NOT penalise for short answers.
// Fluency expectation: natural conversational pace; occasional hesitation acceptable.
// Lexical expectation: familiar-topic vocabulary; range of less-common words NOT required at this part.
// Grammar expectation: accurate basic structures; complex structures are a bonus, not a requirement.`,

//   2: `IELTS Speaking Part 2 – Individual Long Turn / Cue Card (3–4 min total).
// Format: Candidate receives a cue card with a topic + 3–4 bullet points. Given 1 min to prepare, then speaks 1–2 minutes uninterrupted.
// Expected response: A structured monologue that COVERS ALL bullet points on the cue card (intro → address each bullet → wrap-up).
// Fluency expectation: sustained, largely uninterrupted speech; pauses to recall preparation notes are acceptable.
// PENALISE if: bullet points are skipped, or speech is clearly under ~45 seconds.
// Lexical/grammar expectation: higher range expected vs Part 1 due to extended speaking time.`,

//   3: `IELTS Speaking Part 3 – Two-Way Discussion (4–5 min total).
// Format: Examiner-led discussion on abstract/social topics linked to the Part 2 theme.
// Expected response: Extended answers with opinions, reasoning, examples, and abstract thinking.
// Fluency expectation: smooth delivery of complex ideas; discourse markers and hedging language are expected and rewarded.
// PENALISE vague, surface-level, or very short answers.
// Lexical/grammar expectation: highest standard – wide range, complex structures, precise vocabulary required for high bands.`
// }

// // ─── Full band descriptors (compact but complete) ─────────────────────────────

// const RUBRIC = `
// ═══════════════════════════════════════════════
// CRITERION 1: FLUENCY & COHERENCE
// Key dimensions: speech rate/continuity, type of hesitation, repetition & self-correction, use of connectives/discourse markers, coherence & topic development.

// Band 8: Speaks fluently. Hesitations are CONTENT-related (thinking what to say), rarely language-related. Only occasional repetition/self-correction. Uses a wide range of connectives & discourse markers flexibly. Topics developed coherently and appropriately.
// Band 7: Speaks at length without noticeable effort. SOME hesitation (sometimes language-related), some repetition/self-correction – does NOT cause loss of coherence. Uses a wide range of connectives flexibly.
// Band 6: Willing to speak at length. Loses coherence AT TIMES due to occasional repetition, self-correction, or hesitation. Uses a range of connectives/discourse markers but NOT ALWAYS appropriately.
// Band 5: Maintains flow but uses repetition, self-correction, or slowing down to keep going. Hesitations often to search for BASIC lexis & grammar. May OVERUSE certain connectives. Fluent in simple speech; struggles with complex content.
// Band 4: Noticeably slow, frequent pauses. Frequent repetition and self-correction. Uses only simple, repetitive connectives. Breakdowns in coherence.

// Decision rule – hesitation type:
// - Content-related hesitation (Band 7–8): pause while deciding WHAT to say
// - Language-related hesitation (Band 5–6): pause while searching for a word or grammar structure
// ═══════════════════════════════════════════════
// CRITERION 2: LEXICAL RESOURCE
// Key dimensions: vocabulary range (familiar vs unfamiliar topics), flexibility & precision, collocations & idiomatic language, paraphrase ability.

// Band 8: Wide, flexible vocabulary. Uses less-common words and idioms skillfully (only occasional collocation/usage errors). Paraphrases effectively. Precise meaning conveyed.
// Band 7: Flexible vocabulary across many topics. Uses SOME less-common words & idioms, shows collocation awareness (choices not always ideal). Paraphrases effectively.
// Band 6: Wide enough range for extended discussion on many topics. Word choices may be inappropriate but meaning remains CLEAR. Generally successful at paraphrasing.
// Band 5: Sufficient for familiar AND unfamiliar topics but LIMITED flexibility. Attempts paraphrase with MIXED success.
// Band 4: Sufficient for FAMILIAR topics only. Conveys only basic meaning on unfamiliar topics with frequent word choice errors. RARELY attempts paraphrase.

// Collocations & idioms:
// - Band 4–6: None/rare
// - Band 7: Some idioms but with inappropriate choices
// - Band 8: Skillful use with only occasional errors
// ═══════════════════════════════════════════════
// CRITERION 3: GRAMMATICAL RANGE & ACCURACY
// Key dimensions: range/variety of structures (basic → complex → wide), accuracy of basic vs complex structures, overall error impact on communication.

// Band 8: Wide range of structures, used flexibly. MAJORITY of sentences error-free. Very occasional inappropriacies or slips.
// Band 7: A range of complex structures used flexibly. Many error-free sentences. Only some grammatical errors.
// Band 6: Mix of simple and complex structures but LESS flexible. Frequent errors in complex structures, but these RARELY cause comprehension problems.
// Band 5: Mostly basic sentence forms, used with reasonable accuracy. Limited complex structures and these usually contain errors (may self-correct).
// Band 4: Basic sentence forms only, some correct. Rarely uses subordinate clauses. Short, repetitive utterances. Frequent errors.

// Error severity guide:
// - Band 7–8: errors do not affect communication
// - Band 6: errors in complex structures rarely cause comprehension problems
// - Band 5: errors in complex structures cause SOME comprehension problems
// - Band 4: errors frequently lead to misunderstanding
// ═══════════════════════════════════════════════
// CRITERION 4: PRONUNCIATION
// Key dimensions: range of phonological features used, control/sustainability of those features, linking & connected speech, rhythm/stress/intonation, overall intelligibility.

// Band 8: Wide range of phonological features used with precision. Sustains appropriate rhythm, flexible stress & intonation on long utterances (only occasional lapses). Easy to understand throughout. Accent has minimal effect.
// Band 7: Displays positive features of Band 6 + some (not all) features of Band 8.
// Band 6: Uses a range of phonological features but CONTROL IS NOT SUSTAINED. Links phrases appropriately but rhythm affected by stress placement or speech rate. Effective intonation & stress but not maintained throughout. GENERALLY intelligible despite occasional unclear words/sounds.
// Band 5: Positive features of Band 4 + some (not all) features of Band 6.
// Band 4: Uses some intonation & stress but LIMITED control. Some phrase-linking but general rhythm has many errors. Frequent mispronunciation of individual sounds/words reduces clarity. Causes SOME listener difficulty; some passages may be unintelligible.

// Phonological features to evaluate: individual phoneme accuracy, word stress, sentence stress, intonation contours, linking/connected speech, rhythm, speech rate effect on intelligibility.
// ═══════════════════════════════════════════════`

// // ─── Prompt ───────────────────────────────────────────────────────────────────

// function buildPrompt(input: EvaluateInput): string {
//   const { transcript, question, part, speechMetrics: m } = input

//   // ── Fluency signals (from audio metrics) ──
//   const fluencySignals = {
//     speechRate_wpm: m.speechRate,
//     totalLongPauses: m.longPauses?.length ?? 0,
//     longPause_durations_sec: m.longPauses?.map((p) => +p.duration.toFixed(2)) ?? [],
//     fillerWords: m.fillers, // e.g. ["um","uh","like","you know"]
//     repetitions: m.repetitions,
//     fillerCount: m.fillerCount,
//     repetitionCount: m.repetitionCount
//   }

//   // ── Pronunciation signals (from audio metrics) ──
//   // avgPronunciationScore: 0–100 (Azure)
//   // prosody: {score, rhythm, stress, intonation} each 0–100
//   const pronunciationSignals = {
//     avgPhonemeScore_0to100: m.avgPronunciationScore,
//     prosody: m.prosody,
//     // Top 15 worst-scored words – gives enough data for specific feedback
//     mispronounced: (m.wordHighlights ?? [])
//       .filter((w) => w.score < 75)
//       .sort((a, b) => a.score - b.score)
//       .slice(0, 15)
//       .map((w) => ({
//         word: w.word,
//         score: w.score,
//         spokenIPA: w.spokenIpa || '?',
//         expectedIPA: w.expectedIpa || '?'
//       }))
//   }

//   // NOTE: lexical & grammar are evaluated from transcript only (no metrics)
//   // NOTE: fluency coherence/discourse markers are evaluated from transcript + metrics

//   return `You are a certified IELTS Speaking examiner. Evaluate the response below strictly following official IELTS band descriptors. Return feedback in VIETNAMESE.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAM PART CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${PART_CONTEXT[part]}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTION / CUE CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${question}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CANDIDATE TRANSCRIPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${transcript}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-COMPUTED AUDIO METRICS
// (Use as ground truth – do NOT re-derive fluency/pronunciation from text alone)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLUENCY SIGNALS:
// ${JSON.stringify(fluencySignals, null, 0)}

// PRONUNCIATION SIGNALS:
// ${JSON.stringify(pronunciationSignals, null, 0)}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFICIAL IELTS BAND DESCRIPTORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${RUBRIC}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING INSTRUCTIONS (follow in order)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. FLUENCY & COHERENCE
//    → Use metrics: speechRate_wpm, totalLongPauses, longPause_durations_sec, fillerWords, repetitions
//    → Use transcript: identify hesitation TYPE (content vs language search), discourse markers used (and if appropriate), topic development, coherence
//    → Check part context: Part 1 short answers are fine; Part 2 must cover all bullet points; Part 3 must show abstract reasoning

// 2. PRONUNCIATION
//    → Use metrics: avgPhonemeScore_0to100, prosody (rhythm/stress/intonation scores), mispronounced list
//    → Infer: linking/connected speech quality (from rhythm score), stress placement (from stress score), intonation variety (from intonation score)
//    → Mention specific mispronounced words in feedback using spokenIPA vs expectedIPA where relevant

// 3. LEXICAL RESOURCE
//    → Use transcript ONLY (metrics cannot assess vocabulary quality)
//    → Evaluate: range on this topic type (familiar/unfamiliar), precision & appropriacy of word choices, collocations, any less-common or idiomatic vocabulary, paraphrase attempts and success rate

// 4. GRAMMATICAL RANGE & ACCURACY
//    → Use transcript ONLY
//    → Evaluate: range of structures used (basic/complex/wide), accuracy of basic sentences, accuracy of complex sentences, error frequency and impact on communication
//    → Identify up to 5 specific errors with word-index positions

// 5. OVERALL = mean of 4 bands, rounded to nearest 0.5

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OUTPUT – ONLY valid JSON, no markdown, no text outside JSON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// {
//   "fluency": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: nêu rõ (1) tốc độ/mức độ ngập ngừng, (2) loại ngập ngừng là tìm từ hay tìm ý, (3) discourse markers & mạch lạc>"
//   },
//   "pronunciation": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: nêu rõ (1) độ chính xác âm, (2) rhythm/stress/intonation, (3) đề cập ít nhất 1–2 từ phát âm sai cụ thể nếu có>"
//   },
//   "lexical": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: nêu rõ (1) độ rộng vốn từ, (2) độ chính xác/linh hoạt, (3) khả năng paraphrase và dùng thành ngữ/collocation>",
//     "weakWords": [
//       { "word": "<từ dùng chưa tốt hoặc quá đơn giản>", "suggestion": "<từ/cụm thay thế phù hợp hơn>" }
//     ]
//   },
//   "grammar": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: nêu rõ (1) phạm vi cấu trúc dùng, (2) độ chính xác câu đơn vs câu phức, (3) mức độ ảnh hưởng đến giao tiếp>",
//     "errors": [
//       {
//         "startWordIndex": <int>,
//         "endWordIndex": <int>,
//         "original": "<cụm lỗi trích từ transcript>",
//         "correction": "<sửa lại>",
//         "reason": "<giải thích ngắn tiếng Việt>"
//       }
//     ]
//   },
//   "overall": <number 0–9 in 0.5 steps>
// }`
// }

// // ─── Service ──────────────────────────────────────────────────────────────────

// export class LLMEvaluator {
//   private readonly client: Groq
//   private readonly model = 'llama-3.3-70b-versatile'

//   constructor(apiKey: string) {
//     this.client = new Groq({ apiKey })
//   }

//   async evaluate(input: EvaluateInput): Promise<Evaluation> {
//     const prompt = buildPrompt(input)

//     const completion = await this.client.chat.completions.create({
//       model: this.model,
//       temperature: 0.1, // low = consistent, reproducible scores
//       max_tokens: 900, // Vietnamese feedback needs slightly more tokens
//       response_format: { type: 'json_object' },
//       messages: [{ role: 'user', content: prompt }]
//     })

//     const raw = completion.choices[0]?.message?.content ?? '{}'
//     return this._parse(raw, input.transcript)
//   }

//   // ─── Parse & sanitize ─────────────────────────────────────────────────────

//   private _parse(raw: string, transcript: string): Evaluation {
//     let parsed: any
//     try {
//       parsed = JSON.parse(raw)
//     } catch {
//       return this._fallback(transcript)
//     }

//     const snapBand = (v: unknown): number | null => {
//       const n = Number(v)
//       if (isNaN(n)) return null
//       return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
//     }

//     const fluencyBand = snapBand(parsed.fluency?.band)
//     const pronunciationBand = snapBand(parsed.pronunciation?.band)
//     const lexicalBand = snapBand(parsed.lexical?.band)
//     const grammarBand = snapBand(parsed.grammar?.band)

//     const bands = [fluencyBand, pronunciationBand, lexicalBand, grammarBand].filter((b): b is number => b !== null)

//     const overall = bands.length ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2 : null

//     return {
//       transcript,

//       fluency: fluencyBand !== null ? { band: fluencyBand, feedback: String(parsed.fluency?.feedback ?? '') } : null,

//       pronunciation:
//         pronunciationBand !== null
//           ? { band: pronunciationBand, feedback: String(parsed.pronunciation?.feedback ?? '') }
//           : null,

//       lexical:
//         lexicalBand !== null
//           ? {
//               band: lexicalBand,
//               feedback: String(parsed.lexical?.feedback ?? ''),
//               suggestions: Array.isArray(parsed.lexical?.weakWords)
//                 ? parsed.lexical.weakWords.map((w: any) => ({
//                     wordIndex: -1,
//                     original: String(w.word ?? ''),
//                     suggestion: String(w.suggestion ?? ''),
//                     reason: ''
//                   }))
//                 : []
//             }
//           : null,

//       grammar:
//         grammarBand !== null
//           ? {
//               band: grammarBand,
//               feedback: String(parsed.grammar?.feedback ?? ''),
//               errors: Array.isArray(parsed.grammar?.errors)
//                 ? parsed.grammar.errors.map((e: any) => ({
//                     startWordIndex: Number(e.startWordIndex ?? 0),
//                     endWordIndex: Number(e.endWordIndex ?? 0),
//                     original: String(e.original ?? ''),
//                     correction: String(e.correction ?? ''),
//                     reason: String(e.reason ?? '')
//                   }))
//                 : []
//             }
//           : null,

//       overall
//     }
//   }

//   private _fallback(transcript: string): Evaluation {
//     return { transcript, fluency: null, pronunciation: null, lexical: null, grammar: null, overall: null }
//   }
// }

// import Groq from 'groq-sdk'
// import { SpeechMetrics, Evaluation } from '../attempt/attempt.model'

// // ─── Types ────────────────────────────────────────────────────────────────────

// export type EvaluateInput = {
//   transcript: string
//   question: string // Part 2: đã format "topic\n- bullet1\n- bullet2..."
//   part: 1 | 2 | 3
//   speechMetrics: SpeechMetrics
// }

// // ─── Part context ─────────────────────────────────────────────────────────────

// const PART_CONTEXT: Record<number, string> = {
//   1: `IELTS Speaking Part 1 – Introduction & Interview (4–5 min total session).
// Format: Short personal questions on familiar topics (family, hobbies, work, daily life).
// Expected response per question: 2–4 sentences. Brevity is APPROPRIATE – do NOT penalise for short answers.
// Fluency expectation: natural conversational pace; occasional hesitation acceptable.
// Lexical/Grammar expectation: familiar-topic vocabulary and basic–intermediate structures; advanced range is a bonus, not required.`,

//   2: `IELTS Speaking Part 2 – Individual Long Turn / Cue Card (3–4 min total section).
// Format: Candidate receives a cue card (topic + 3–4 bullet points), has 1 min to prepare, then speaks 1–2 minutes uninterrupted.
// Expected: A structured monologue covering ALL bullet points (intro → each bullet → wrap-up).
// Target duration: 60–120 seconds of actual speech.
// PENALISE (lower fluency band) if: bullet points are skipped, or speech duration is clearly under 45 seconds.
// Lexical/grammar expectation: higher range expected due to extended speaking time.`,

//   3: `IELTS Speaking Part 3 – Two-Way Discussion (4–5 min total section).
// Format: Examiner-led discussion on abstract/social topics linked to Part 2 theme.
// Expected: Extended answers with opinion, reasoning, examples, and abstract thinking.
// Fluency expectation: smooth delivery of complex ideas; discourse markers and hedging language are expected at higher bands.
// PENALISE vague, very short, or surface-level answers.
// Lexical/grammar expectation: highest standard – wide range, complex structures, precise vocabulary required for high bands.`
// }

// // ─── Full band descriptors 4–9 for all 4 criteria ────────────────────────────

// const RUBRIC = `
// ═══════════════════════════════════════════════
// CRITERION 1: FLUENCY & COHERENCE
// Key dimensions: speech rate & continuity, type of hesitation, repetition & self-correction, connectives & discourse markers (range + appropriacy), coherence & topic development.

// Band 9: Speaks fluently with rare repetition or self-correction. Any hesitation is CONTENT-related only (never searching for words/grammar). Fully coherent, uses cohesive features appropriately throughout. Topics developed fully, coherently, and logically.
// Band 8: Speaks fluently. Hesitations mainly CONTENT-related, rarely language-related. Only occasional repetition/self-correction. Uses a wide range of connectives & discourse markers flexibly. Topics developed coherently and appropriately.
// Band 7: Speaks at length without noticeable effort. SOME hesitation (sometimes language-related), some repetition/self-correction – does NOT cause loss of coherence. Uses a wide, flexible range of connectives & discourse markers.
// Band 6: Willing and able to speak at length. Loses coherence AT TIMES due to repetition, self-correction, or hesitation. Uses a range of connectives/discourse markers but NOT ALWAYS appropriately.
// Band 5: Maintains flow but relies on repetition, self-correction, or slowing down. Hesitations often to search for BASIC lexis or grammar. May OVERUSE certain connectives. Fluent in simple speech; struggles with complex content.
// Band 4: Noticeably slow with frequent, noticeable pauses. Frequent repetition and self-correction. Only simple, repetitive connectives. Frequent breakdowns in coherence.

// DECISION RULE – hesitation type (critical for band 6 vs 7 vs 8):
// - Content-related hesitation → Band 7–8 (pauses while deciding WHAT to say)
// - Language-related hesitation → Band 5–6 (pauses while searching for a word or grammar)

// ═══════════════════════════════════════════════
// CRITERION 2: LEXICAL RESOURCE
// Key dimensions: vocabulary range (familiar vs unfamiliar topics), flexibility & precision, collocations & idiomatic language, paraphrase ability.

// Band 9: Full flexibility and precision across all topics. Uses idioms naturally and accurately.
// Band 8: Wide, flexible vocabulary. Uses less-common words and idioms skillfully (only occasional collocation/usage errors). Paraphrases effectively. Conveys precise meaning.
// Band 7: Flexible vocabulary across many topics. Uses SOME less-common words & idioms, shows collocation awareness (choices not always ideal). Paraphrases effectively in multiple ways.
// Band 6: Wide enough range for extended discussion. Word choices may be inappropriate but meaning remains CLEAR. Generally successful at paraphrasing.
// Band 5: Sufficient for familiar AND unfamiliar topics but LIMITED flexibility. Attempts paraphrase with MIXED success.
// Band 4: Sufficient for FAMILIAR topics only. Only basic meaning conveyed on unfamiliar topics; frequent word choice errors. RARELY attempts paraphrase.

// Collocations & idioms scale:
// Band 4–6: None or rare | Band 7: some idioms but with inappropriate choices | Band 8: skillful with occasional errors | Band 9: natural and accurate

// ═══════════════════════════════════════════════
// CRITERION 3: GRAMMATICAL RANGE & ACCURACY
// Key dimensions: range/variety of structures (basic → complex → wide), accuracy of basic vs complex structures, error impact on communication.

// Band 9: Consistently accurate and appropriate. Only the very minor slips found in native speech.
// Band 8: Wide range of structures used flexibly. MAJORITY of sentences error-free. Very occasional inappropriacies or slips.
// Band 7: Range of complex structures used with flexibility. Frequently produces error-free sentences. Only some grammatical errors.
// Band 6: Mix of simple and complex structures but LESS flexible. Frequent errors in complex structures, but these RARELY cause comprehension problems.
// Band 5: Mostly basic sentence forms with reasonable accuracy. Limited complex structures; when used, they usually contain errors (may self-correct).
// Band 4: Basic sentence forms only, some correct. Rarely uses subordinate clauses. Short, repetitive utterances. Frequent errors.

// Error severity scale:
// Band 7–9: errors do not affect communication
// Band 6: errors in complex structures rarely cause comprehension problems
// Band 5: errors in complex structures cause SOME comprehension problems
// Band 4: errors frequently lead to misunderstanding

// ═══════════════════════════════════════════════
// CRITERION 4: PRONUNCIATION
// Key dimensions: phoneme accuracy (individual sounds), word stress, sentence stress, intonation, linking & connected speech, rhythm, overall intelligibility & sustainability of control.

// Band 9: Full range of phonological features with accuracy and subtlety throughout. Effortless to understand. Accent does not affect intelligibility.
// Band 8: Wide range of features used with precision. Sustains appropriate rhythm, flexible stress & intonation on long utterances (only occasional lapses). Easy to understand throughout. Accent has minimal effect.
// Band 7: Displays all positive features of Band 6 and some (not all) of Band 8.
// Band 6: Uses a range of phonological features but CONTROL IS NOT SUSTAINED. Links phrases appropriately but rhythm may be affected by stress or speech rate. Effective intonation & stress but not maintained throughout. GENERALLY intelligible despite occasional unclear words.
// Band 5: Displays all positive features of Band 4 and some (not all) of Band 6.
// Band 4: Some intonation & stress used but LIMITED control. Some phrase-linking but general rhythm has many errors. Frequent mispronunciation of sounds/words reduces clarity. Causes SOME listener difficulty; some passages may be unintelligible.

// Sustainability scale:
// Band 4: Attempts but lapses are frequent | Band 6: Effective but not sustained | Band 8: Sustained with occasional lapses | Band 9: Fully sustained throughout
// ═══════════════════════════════════════════════`

// // ─── Prompt ───────────────────────────────────────────────────────────────────

// function buildPrompt(input: EvaluateInput): string {
//   const { transcript, question, part, speechMetrics: m } = input

//   // ── Fluency signals ──
//   const fluencySignals = {
//     duration_sec: m.duration, // ← total speech duration
//     speechRate_wpm: m.speechRate,
//     totalLongPauses: m.longPauses?.length ?? 0,
//     longPause_durations_sec: m.longPauses?.map((p) => +p.duration.toFixed(2)) ?? [],
//     fillerWords: m.fillers,
//     fillerCount: m.fillerCount,
//     repetitions: m.repetitions,
//     repetitionCount: m.repetitionCount
//   }

//   // ── Pronunciation signals ──
//   const pronunciationSignals = {
//     avgPhonemeScore_0to100: m.avgPronunciationScore,
//     prosody: m.prosody, // { score, rhythm, stress, intonation } each 0–100
//     mispronounced: (m.wordHighlights ?? [])
//       .filter((w) => w.score < 75)
//       .sort((a, b) => a.score - b.score)
//       .slice(0, 15)
//       .map((w) => ({
//         word: w.word,
//         score: w.score,
//         spokenIPA: w.spokenIpa || '?',
//         expectedIPA: w.expectedIpa || '?'
//       }))
//   }

//   return `You are a certified IELTS Speaking examiner. Evaluate the candidate response strictly following official IELTS band descriptors (bands 0–9). Return all feedback in VIETNAMESE.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAM PART CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${PART_CONTEXT[part]}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTION / CUE CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${question}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CANDIDATE TRANSCRIPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${transcript}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-COMPUTED AUDIO METRICS
// Use as ground truth. Do NOT re-derive fluency/pronunciation judgements from text alone.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLUENCY SIGNALS (from audio):
// ${JSON.stringify(fluencySignals, null, 0)}

// PRONUNCIATION SIGNALS (from audio):
// ${JSON.stringify(pronunciationSignals, null, 0)}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFICIAL IELTS BAND DESCRIPTORS (bands 4–9)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${RUBRIC}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING INSTRUCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. FLUENCY & COHERENCE
//    • Metrics → speechRate_wpm, duration_sec, totalLongPauses, longPause_durations_sec, fillerWords, repetitions
//    • Transcript → classify hesitation type (content vs language-search), evaluate discourse markers (range & appropriacy), assess coherence and topic development
//    • Part-specific → Part 2: check duration_sec against 45–120s target; Part 3: check for abstract reasoning and extended responses

// 2. PRONUNCIATION
//    • Metrics → avgPhonemeScore_0to100, prosody.rhythm (linked speech quality), prosody.stress (word/sentence stress), prosody.intonation (intonation variety), mispronounced list
//    • Infer sustainability: if prosody scores are inconsistent or low, control is "not sustained" (Band 6 or below)
//    • Name specific mispronounced words in feedback (spokenIPA vs expectedIPA)

// 3. LEXICAL RESOURCE
//    • Transcript only (no audio metric can assess vocabulary quality)
//    • Evaluate: range on this topic (familiar/unfamiliar), precision & appropriacy, collocations & idioms, paraphrase attempts and success rate

// 4. GRAMMATICAL RANGE & ACCURACY
//    • Transcript only
//    • Evaluate: range of structures (basic / some complex / wide complex), accuracy of basic vs complex sentences, how much errors impact communication
//    • List up to 5 specific errors with word-index positions in transcript

// 5. OVERALL = arithmetic mean of 4 bands, rounded to nearest 0.5

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OUTPUT — ONLY valid JSON, no markdown, no text outside the JSON object
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// {
//   "fluency": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) tốc độ & thời lượng nói, (2) loại ngập ngừng (tìm từ hay tìm ý), (3) discourse markers & mạch lạc>"
//   },
//   "pronunciation": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) độ chính xác âm & mức độ duy trì, (2) rhythm/stress/intonation, (3) nêu ít nhất 1–2 từ phát âm sai cụ thể nếu có>"
//   },
//   "lexical": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) độ rộng & linh hoạt vốn từ, (2) collocation/idiom, (3) khả năng paraphrase>",
//     "weakWords": [
//       { "word": "<từ dùng quá đơn giản hoặc sai>", "suggestion": "<từ/cụm thay thế phù hợp hơn>" }
//     ]
//   },
//   "grammar": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) phạm vi cấu trúc dùng, (2) độ chính xác câu đơn vs câu phức, (3) mức độ ảnh hưởng giao tiếp>",
//     "errors": [
//       {
//         "startWordIndex": <int>,
//         "endWordIndex": <int>,
//         "original": "<cụm lỗi trích từ transcript>",
//         "correction": "<sửa lại>",
//         "reason": "<giải thích ngắn tiếng Việt>"
//       }
//     ]
//   },
//   "overall": <number 0–9 in 0.5 steps>
// }`
// }

// // ─── Service ──────────────────────────────────────────────────────────────────

// export class LLMEvaluator {
//   private readonly client: Groq
//   private readonly model = 'llama-3.3-70b-versatile'

//   constructor(apiKey: string) {
//     this.client = new Groq({ apiKey })
//   }

//   async evaluate(input: EvaluateInput): Promise<Evaluation> {
//     const prompt = buildPrompt(input)

//     const completion = await this.client.chat.completions.create({
//       model: this.model,
//       temperature: 0.1,
//       max_tokens: 900,
//       response_format: { type: 'json_object' },
//       messages: [{ role: 'user', content: prompt }]
//     })

//     const raw = completion.choices[0]?.message?.content ?? '{}'
//     return this._parse(raw, input.transcript)
//   }

//   // ─── Parse & sanitize ─────────────────────────────────────────────────────

//   private _parse(raw: string, transcript: string): Evaluation {
//     let parsed: any
//     try {
//       parsed = JSON.parse(raw)
//     } catch {
//       return this._fallback(transcript)
//     }

//     const snapBand = (v: unknown): number | null => {
//       const n = Number(v)
//       if (isNaN(n)) return null
//       return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
//     }

//     const fluencyBand = snapBand(parsed.fluency?.band)
//     const pronunciationBand = snapBand(parsed.pronunciation?.band)
//     const lexicalBand = snapBand(parsed.lexical?.band)
//     const grammarBand = snapBand(parsed.grammar?.band)

//     const bands = [fluencyBand, pronunciationBand, lexicalBand, grammarBand].filter((b): b is number => b !== null)

//     const overall = bands.length ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2 : null

//     return {
//       transcript,
//       fluency: fluencyBand !== null ? { band: fluencyBand, feedback: String(parsed.fluency?.feedback ?? '') } : null,
//       pronunciation:
//         pronunciationBand !== null
//           ? { band: pronunciationBand, feedback: String(parsed.pronunciation?.feedback ?? '') }
//           : null,
//       lexical:
//         lexicalBand !== null
//           ? {
//               band: lexicalBand,
//               feedback: String(parsed.lexical?.feedback ?? ''),
//               suggestions: Array.isArray(parsed.lexical?.weakWords)
//                 ? parsed.lexical.weakWords.map((w: any) => ({
//                     wordIndex: -1,
//                     original: String(w.word ?? ''),
//                     suggestion: String(w.suggestion ?? ''),
//                     reason: ''
//                   }))
//                 : []
//             }
//           : null,
//       grammar:
//         grammarBand !== null
//           ? {
//               band: grammarBand,
//               feedback: String(parsed.grammar?.feedback ?? ''),
//               errors: Array.isArray(parsed.grammar?.errors)
//                 ? parsed.grammar.errors.map((e: any) => ({
//                     startWordIndex: Number(e.startWordIndex ?? 0),
//                     endWordIndex: Number(e.endWordIndex ?? 0),
//                     original: String(e.original ?? ''),
//                     correction: String(e.correction ?? ''),
//                     reason: String(e.reason ?? '')
//                   }))
//                 : []
//             }
//           : null,
//       overall
//     }
//   }

//   private _fallback(transcript: string): Evaluation {
//     return { transcript, fluency: null, pronunciation: null, lexical: null, grammar: null, overall: null }
//   }
// }

// import Groq from 'groq-sdk'
// import { SpeechMetrics, Evaluation } from '../attempt/attempt.model'

// // ─── Types ────────────────────────────────────────────────────────────────────

// export type EvaluateInput = {
//   transcript: string
//   question: string // Part 2: đã format "topic\n- bullet1\n- bullet2..."
//   part: 1 | 2 | 3
//   speechMetrics: SpeechMetrics
// }

// // ─── Part context ─────────────────────────────────────────────────────────────

// const PART_CONTEXT: Record<number, string> = {
//   1: `IELTS Speaking Part 1 – Introduction & Interview (4–5 min total session).
// Format: Short personal questions on familiar topics (family, hobbies, work, daily life).
// Expected response per question: 2–4 sentences. Brevity is APPROPRIATE – do NOT penalise for short answers.
// Fluency expectation: natural conversational pace; occasional hesitation acceptable.
// Lexical/Grammar expectation: familiar-topic vocabulary and basic–intermediate structures; advanced range is a bonus, not required.`,

//   2: `IELTS Speaking Part 2 – Individual Long Turn / Cue Card (3–4 min total section).
// Format: Candidate receives a cue card (topic + 3–4 bullet points), has 1 min to prepare, then speaks 1–2 minutes uninterrupted.
// Expected: A structured monologue covering ALL bullet points (intro → each bullet → wrap-up).
// Target duration: 60–120 seconds of actual speech.
// PENALISE (lower fluency band) if: bullet points are skipped, or speech duration is clearly under 45 seconds.
// Lexical/grammar expectation: higher range expected due to extended speaking time.`,

//   3: `IELTS Speaking Part 3 – Two-Way Discussion (4–5 min total section).
// Format: Examiner-led discussion on abstract/social topics linked to Part 2 theme.
// Expected: Extended answers with opinion, reasoning, examples, and abstract thinking.
// Fluency expectation: smooth delivery of complex ideas; discourse markers and hedging language are expected at higher bands.
// PENALISE vague, very short, or surface-level answers.
// Lexical/grammar expectation: highest standard – wide range, complex structures, precise vocabulary required for high bands.`
// }

// // ─── Band descriptors ─────────────────────────────────────────────────────────

// const RUBRIC = `
// ═══════════════════════════════════════════════
// CRITERION 1: FLUENCY & COHERENCE
// Key dimensions: speech rate & continuity, type of hesitation, repetition & self-correction, connectives & discourse markers (range + appropriacy), coherence & topic development.

// Band 9: Speaks fluently with rare repetition or self-correction. Any hesitation is CONTENT-related only (never searching for words/grammar). Fully coherent, uses cohesive features appropriately throughout. Topics developed fully, coherently, and logically.
// Band 8: Speaks fluently. Hesitations mainly CONTENT-related, rarely language-related. Only occasional repetition/self-correction. Uses a wide range of connectives & discourse markers flexibly. Topics developed coherently and appropriately.
// Band 7: Speaks at length without noticeable effort. SOME hesitation (sometimes language-related), some repetition/self-correction – does NOT cause loss of coherence. Uses a wide, flexible range of connectives & discourse markers.
// Band 6: Willing and able to speak at length. Loses coherence AT TIMES due to repetition, self-correction, or hesitation. Uses a range of connectives/discourse markers but NOT ALWAYS appropriately.
// Band 5: Maintains flow but relies on repetition, self-correction, or slowing down. Hesitations often to search for BASIC lexis or grammar. May OVERUSE certain connectives. Fluent in simple speech; struggles with complex content.
// Band 4: Noticeably slow with frequent, noticeable pauses. Frequent repetition and self-correction. Only simple, repetitive connectives. Frequent breakdowns in coherence.

// DECISION RULE – hesitation type (critical for band 6 vs 7 vs 8):
// - Content-related hesitation → Band 7–8: pauses while deciding WHAT to say; look for pause BETWEEN sentences/ideas in the annotated transcript
// - Language-related hesitation → Band 5–6: pauses MID-SENTENCE before a word or after a filler; look for [PAUSE] immediately before/after a content word or filler in the annotated transcript

// ═══════════════════════════════════════════════
// CRITERION 2: LEXICAL RESOURCE
// Key dimensions: vocabulary range (familiar vs unfamiliar topics), flexibility & precision, collocations & idiomatic language, paraphrase ability.

// Band 9: Full flexibility and precision across all topics. Uses idioms naturally and accurately.
// Band 8: Wide, flexible vocabulary. Uses less-common words and idioms skillfully (only occasional collocation/usage errors). Paraphrases effectively. Conveys precise meaning.
// Band 7: Flexible vocabulary across many topics. Uses SOME less-common words & idioms, shows collocation awareness (choices not always ideal). Paraphrases effectively in multiple ways.
// Band 6: Wide enough range for extended discussion. Word choices may be inappropriate but meaning remains CLEAR. Generally successful at paraphrasing.
// Band 5: Sufficient for familiar AND unfamiliar topics but LIMITED flexibility. Attempts paraphrase with MIXED success.
// Band 4: Sufficient for FAMILIAR topics only. Only basic meaning conveyed on unfamiliar topics; frequent word choice errors. RARELY attempts paraphrase.

// Collocations & idioms scale:
// Band 4–6: None or rare | Band 7: some idioms but with inappropriate choices | Band 8: skillful with occasional errors | Band 9: natural and accurate

// ═══════════════════════════════════════════════
// CRITERION 3: GRAMMATICAL RANGE & ACCURACY
// Key dimensions: range/variety of structures (basic → complex → wide), accuracy of basic vs complex structures, error impact on communication.

// Band 9: Consistently accurate and appropriate. Only the very minor slips found in native speech.
// Band 8: Wide range of structures used flexibly. MAJORITY of sentences error-free. Very occasional inappropriacies or slips.
// Band 7: Range of complex structures used with flexibility. Frequently produces error-free sentences. Only some grammatical errors.
// Band 6: Mix of simple and complex structures but LESS flexible. Frequent errors in complex structures, but these RARELY cause comprehension problems.
// Band 5: Mostly basic sentence forms with reasonable accuracy. Limited complex structures; when used, they usually contain errors (may self-correct).
// Band 4: Basic sentence forms only, some correct. Rarely uses subordinate clauses. Short, repetitive utterances. Frequent errors.

// Error severity scale:
// Band 7–9: errors do not affect communication
// Band 6: errors in complex structures rarely cause comprehension problems
// Band 5: errors in complex structures cause SOME comprehension problems
// Band 4: errors frequently lead to misunderstanding

// NOTE: word indices in errors refer to the INDEXED TRANSCRIPT provided below.

// ═══════════════════════════════════════════════
// CRITERION 4: PRONUNCIATION
// Key dimensions: phoneme accuracy (individual sounds), word stress, sentence stress, intonation, linking & connected speech, rhythm, overall intelligibility & sustainability of control.

// Band 9: Full range of phonological features with accuracy and subtlety throughout. Effortless to understand. Accent does not affect intelligibility.
// Band 8: Wide range of features used with precision. Sustains appropriate rhythm, flexible stress & intonation on long utterances (only occasional lapses). Easy to understand throughout. Accent has minimal effect.
// Band 7: Displays all positive features of Band 6 and some (not all) of Band 8.
// Band 6: Uses a range of phonological features but CONTROL IS NOT SUSTAINED. Links phrases appropriately but rhythm may be affected by stress or speech rate. Effective intonation & stress but not maintained throughout. GENERALLY intelligible despite occasional unclear words.
// Band 5: Displays all positive features of Band 4 and some (not all) of Band 6.
// Band 4: Some intonation & stress used but LIMITED control. Some phrase-linking but general rhythm has many errors. Frequent mispronunciation of sounds/words reduces clarity. Causes SOME listener difficulty; some passages may be unintelligible.

// Prosody score interpretation (0–100 scale from Azure):
// - rhythm  ≥ 80 → natural connected speech / linking | 60–79 → some linking errors | < 60 → choppy, poor linking
// - stress   ≥ 80 → accurate word & sentence stress     | 60–79 → some stress errors  | < 60 → frequent stress errors
// - intonation ≥ 80 → varied, natural intonation        | 60–79 → limited variation   | < 60 → monotone or inappropriate rises/falls

// Sustainability scale:
// Band 4: Attempts but lapses are frequent | Band 6: Effective but not sustained | Band 8: Sustained with occasional lapses | Band 9: Fully sustained throughout
// ═══════════════════════════════════════════════`

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /**
//  * Build an annotated transcript that embeds [PAUSE Xs] markers at the correct
//  * positions between words, using wordHighlights offset/duration data.
//  * This lets the LLM see WHERE pauses occur (mid-sentence vs between sentences)
//  * to classify hesitation type accurately.
//  *
//  * Output example:
//  *   "0:I 1:think [PAUSE 1.2s] 2:it 3:is [PAUSE 0.8s] 4:very 5:important"
//  */
// function buildAnnotatedTranscript(
//   tokens: string[],
//   highlights: SpeechMetrics['wordHighlights'],
//   longPauseThreshold = 0.5 // seconds – same threshold used to build longPauses[]
// ): string {
//   if (!tokens?.length) return ''
//   if (!highlights?.length) return tokens.map((w, i) => `${i}:${w}`).join(' ')

//   // Sort highlights by offset so we can compute gaps
//   const sorted = [...highlights].sort((a, b) => a.offset - b.offset)

//   const parts: string[] = []

//   for (let i = 0; i < sorted.length; i++) {
//     const curr = sorted[i]
//     const word = tokens[curr.wordIndex] ?? curr.word
//     parts.push(`${curr.wordIndex}:${word}`)

//     if (i < sorted.length - 1) {
//       const next = sorted[i + 1]
//       const gapStart = curr.offset + curr.duration // ms
//       const gapEnd = next.offset // ms
//       const gapSec = (gapEnd - gapStart) / 1000

//       if (gapSec >= longPauseThreshold) {
//         parts.push(`[PAUSE ${gapSec.toFixed(1)}s]`)
//       }
//     }
//   }

//   return parts.join(' ')
// }

// // ─── Prompt builder ───────────────────────────────────────────────────────────

// function buildPrompt(input: EvaluateInput): string {
//   const { transcript, question, part, speechMetrics: m } = input

//   // ── Annotated transcript: words with indices + pause markers ──
//   // LLM uses word indices for grammar error positions,
//   // and pause positions/locations to classify hesitation type.
//   const annotatedTranscript = buildAnnotatedTranscript(m.transcriptTokens ?? [], m.wordHighlights ?? [])

//   // ── Fluency signals ──
//   const fluencySignals = {
//     duration_sec: m.duration,
//     speechRate_wpm: m.speechRate,
//     wordCount: m.wordCount,
//     totalLongPauses: m.longPauses?.length ?? 0,
//     // Full pause list so LLM can see distribution (short vs long pauses)
//     longPauses:
//       m.longPauses?.map((p) => ({
//         start_sec: +(p.start / 1000).toFixed(2),
//         end_sec: +(p.end / 1000).toFixed(2),
//         duration_sec: +p.duration.toFixed(2)
//       })) ?? [],
//     fillerWords: m.fillers,
//     fillerCount: m.fillerCount,
//     repetitions: m.repetitions,
//     repetitionCount: m.repetitionCount
//   }

//   // ── Pronunciation signals ──
//   const pronunciationSignals = {
//     avgPhonemeScore_0to100: m.avgPronunciationScore,
//     // Prosody scores 0–100 (see interpretation guide in rubric)
//     prosody: {
//       overall: m.prosody?.score,
//       rhythm: m.prosody?.rhythm, // linked speech / connected speech quality
//       stress: m.prosody?.stress, // word & sentence stress accuracy
//       intonation: m.prosody?.intonation // intonation variety & appropriacy
//     },
//     // Up to 15 worst-scored words for specific feedback
//     mispronounced: (m.wordHighlights ?? [])
//       .filter((w) => w.score < 75)
//       .sort((a, b) => a.score - b.score)
//       .slice(0, 15)
//       .map((w) => ({
//         wordIndex: w.wordIndex,
//         word: w.word,
//         score: w.score,
//         spokenIPA: w.spokenIpa || '?',
//         expectedIPA: w.expectedIpa || '?'
//       }))
//   }

//   return `You are a certified IELTS Speaking examiner. Evaluate the candidate response strictly following official IELTS band descriptors (bands 0–9). Return all feedback in VIETNAMESE.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAM PART CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${PART_CONTEXT[part]}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTION / CUE CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${question}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEXED & ANNOTATED TRANSCRIPT
// (format: "wordIndex:word [PAUSE Xs]" – use word indices for grammar error positions; use [PAUSE] location relative to sentence boundaries to classify hesitation type)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${annotatedTranscript || transcript}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-COMPUTED AUDIO METRICS (ground truth – do not re-derive from text)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLUENCY SIGNALS:
// ${JSON.stringify(fluencySignals, null, 0)}

// PRONUNCIATION SIGNALS:
// ${JSON.stringify(pronunciationSignals, null, 0)}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFICIAL IELTS BAND DESCRIPTORS (0–9)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${RUBRIC}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING INSTRUCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. FLUENCY & COHERENCE
//    • Metrics → duration_sec (check against part target), speechRate_wpm, wordCount, longPauses, fillerWords, repetitions
//    • Annotated transcript → find [PAUSE] markers: pauses BETWEEN sentences/ideas = content hesitation (Band 7–8); pauses MID-SENTENCE before a content word = language hesitation (Band 5–6)
//    • Transcript → discourse markers used (list them), range & appropriacy, topic development, coherence across the response
//    • Part 2 specific: check if all cue card bullet points are addressed

// 2. PRONUNCIATION
//    • avgPhonemeScore ≥ 85 → Band 7–8 range | 70–84 → Band 5–6 range | < 70 → Band 4 range
//    • prosody.rhythm: linked speech quality (see interpretation guide in rubric)
//    • prosody.stress: word & sentence stress accuracy
//    • prosody.intonation: intonation variety & appropriacy
//    • Cross-check all 3 prosody scores for consistency → determines sustainability level → determines band 6 vs 7 vs 8
//    • Name 1–2 specific mispronounced words with spokenIPA vs expectedIPA in feedback

// 3. LEXICAL RESOURCE
//    • Transcript only
//    • Consider wordCount: a longer response gives more evidence of range
//    • Evaluate: range on this topic type, precision & word choice appropriacy, any less-common words or idioms, collocations, paraphrase attempts

// 4. GRAMMATICAL RANGE & ACCURACY
//    • Transcript only (use wordIndex from annotated transcript for error positions)
//    • Evaluate: range of structures, accuracy of simple vs complex sentences, error frequency & communication impact
//    • List up to 5 errors with exact startWordIndex and endWordIndex from the annotated transcript

// 5. OVERALL = arithmetic mean of 4 bands, rounded to nearest 0.5

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OUTPUT — ONLY valid JSON, no markdown, no text outside the JSON object
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// {
//   "fluency": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) tốc độ & thời lượng nói, (2) loại ngập ngừng (tìm từ hay tìm ý) với ví dụ cụ thể từ transcript, (3) discourse markers dùng và mức độ mạch lạc>"
//   },
//   "pronunciation": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) độ chính xác âm tổng thể & mức độ duy trì, (2) rhythm/stress/intonation, (3) nêu ít nhất 1–2 từ phát âm sai cụ thể>"
//   },
//   "lexical": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) độ rộng & linh hoạt vốn từ, (2) collocation/idiom/less-common words, (3) khả năng paraphrase>",
//     "weakWords": [
//       { "word": "<từ dùng quá đơn giản hoặc không phù hợp>", "suggestion": "<từ/cụm thay thế tốt hơn>" }
//     ]
//   },
//   "grammar": {
//     "band": <number 0–9 in 0.5 steps>,
//     "feedback": "<2–3 câu tiếng Việt: (1) phạm vi cấu trúc dùng, (2) độ chính xác câu đơn vs câu phức, (3) mức độ ảnh hưởng đến giao tiếp>",
//     "errors": [
//       {
//         "startWordIndex": <int from annotated transcript>,
//         "endWordIndex": <int from annotated transcript>,
//         "original": "<cụm lỗi trích nguyên văn từ transcript>",
//         "correction": "<sửa lại>",
//         "reason": "<giải thích ngắn tiếng Việt>"
//       }
//     ]
//   },
//   "overall": <number 0–9 in 0.5 steps>
// }`
// }

// // ─── Service ──────────────────────────────────────────────────────────────────

// export class LLMEvaluator {
//   private readonly client: Groq
//   private readonly model = 'llama-3.3-70b-versatile'

//   constructor(apiKey: string) {
//     this.client = new Groq({ apiKey })
//   }

//   async evaluate(input: EvaluateInput): Promise<Evaluation> {
//     const prompt = buildPrompt(input)

//     const completion = await this.client.chat.completions.create({
//       model: this.model,
//       temperature: 0.1,
//       max_tokens: 1000, // tăng thêm chút để đủ cho annotated transcript + feedback dài hơn
//       response_format: { type: 'json_object' },
//       messages: [{ role: 'user', content: prompt }]
//     })

//     const raw = completion.choices[0]?.message?.content ?? '{}'
//     return this._parse(raw, input.transcript)
//   }

//   // ─── Parse & sanitize ─────────────────────────────────────────────────────

//   private _parse(raw: string, transcript: string): Evaluation {
//     let parsed: any
//     try {
//       parsed = JSON.parse(raw)
//     } catch {
//       return this._fallback(transcript)
//     }

//     const snapBand = (v: unknown): number | null => {
//       const n = Number(v)
//       if (isNaN(n)) return null
//       return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
//     }

//     const fluencyBand = snapBand(parsed.fluency?.band)
//     const pronunciationBand = snapBand(parsed.pronunciation?.band)
//     const lexicalBand = snapBand(parsed.lexical?.band)
//     const grammarBand = snapBand(parsed.grammar?.band)

//     const bands = [fluencyBand, pronunciationBand, lexicalBand, grammarBand].filter((b): b is number => b !== null)

//     const overall = bands.length ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2 : null

//     return {
//       transcript,
//       fluency: fluencyBand !== null ? { band: fluencyBand, feedback: String(parsed.fluency?.feedback ?? '') } : null,
//       pronunciation:
//         pronunciationBand !== null
//           ? { band: pronunciationBand, feedback: String(parsed.pronunciation?.feedback ?? '') }
//           : null,
//       lexical:
//         lexicalBand !== null
//           ? {
//               band: lexicalBand,
//               feedback: String(parsed.lexical?.feedback ?? ''),
//               suggestions: Array.isArray(parsed.lexical?.weakWords)
//                 ? parsed.lexical.weakWords.map((w: any) => ({
//                     wordIndex: -1,
//                     original: String(w.word ?? ''),
//                     suggestion: String(w.suggestion ?? ''),
//                     reason: ''
//                   }))
//                 : []
//             }
//           : null,
//       grammar:
//         grammarBand !== null
//           ? {
//               band: grammarBand,
//               feedback: String(parsed.grammar?.feedback ?? ''),
//               errors: Array.isArray(parsed.grammar?.errors)
//                 ? parsed.grammar.errors.map((e: any) => ({
//                     startWordIndex: Number(e.startWordIndex ?? 0),
//                     endWordIndex: Number(e.endWordIndex ?? 0),
//                     original: String(e.original ?? ''),
//                     correction: String(e.correction ?? ''),
//                     reason: String(e.reason ?? '')
//                   }))
//                 : []
//             }
//           : null,
//       overall
//     }
//   }

//   private _fallback(transcript: string): Evaluation {
//     return { transcript, fluency: null, pronunciation: null, lexical: null, grammar: null, overall: null }
//   }
// }

import Groq from 'groq-sdk'
import { Evaluation, SpeechMetrics, Word } from '~/modules/attempt/attempt.model'

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Part context ─────────────────────────────────────────────────────────────

// ─── Annotated transcript builder ────────────────────────────────────────────
// Produces: "0:I 1:think [PAUSE 1.2s] 2:it 3:is 4:very 5:important"
// LLM uses:
//   • wordIndex prefix → exact positions for grammar/lexical errors
//   • [PAUSE] location → classify hesitation type (between-sentence vs mid-sentence)

// ─── Prompt builder ───────────────────────────────────────────────────────────

// ─── Index validator ──────────────────────────────────────────────────────────

// function clampIndex(v: unknown, max: number): number {
//   const n = Number(v)
//   if (isNaN(n)) return 0
//   return Math.max(0, Math.min(max, Math.floor(n)))
// }

// // ─── Service ──────────────────────────────────────────────────────────────────

// export class LLMEvaluator {
//   private readonly client: Groq
//   private readonly model = 'llama-3.3-70b-versatile'

//   constructor(apiKey: string) {
//     this.client = new Groq({ apiKey })
//   }

//   async evaluate(input: EvaluateInput): Promise<Evaluation> {
//     const prompt = buildPrompt(input)

//     const completion = await this.client.chat.completions.create({
//       model: this.model,
//       temperature: 0.1,
//       max_tokens: 1000,
//       response_format: { type: 'json_object' },
//       messages: [{ role: 'user', content: prompt }]
//     })

//     const raw = completion.choices[0]?.message?.content ?? '{}'
//     return this._parse(raw, input)
//   }

//   // ─── Parse & sanitize ─────────────────────────────────────────────────────

// }
