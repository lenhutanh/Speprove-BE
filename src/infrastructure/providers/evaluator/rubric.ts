export const PART_CONTEXT: Record<number, string> = {
  1: `IELTS Speaking Part 1 – Introduction & Interview (4–5 min total session).
Format: Short personal questions on familiar topics (family, hobbies, work, daily life).
Expected response for THIS question: 10–30 seconds (2–4 sentences). Brevity is APPROPRIATE – do NOT penalise for short answers.
Fluency: natural conversational pace; occasional hesitation acceptable.
Lexical/Grammar: familiar-topic vocabulary and basic–intermediate structures; advanced range is a bonus, not required.`,

  2: `IELTS Speaking Part 2 – Individual Long Turn / Cue Card (3–4 min total section).
Format: Candidate receives a cue card (topic + 3–4 bullet points), has 1 min to prepare, then speaks 1–2 minutes uninterrupted.
Expected response for THIS question: 60–120 seconds of actual speech covering ALL bullet points (intro → each bullet → wrap-up).
PENALISE (lower fluency band) if: bullet points are skipped, or speech duration is clearly under 45 seconds.
Lexical/Grammar: higher range expected due to extended speaking time.`,

  3: `IELTS Speaking Part 3 – Two-Way Discussion (4–5 min total section).
Format: Examiner-led discussion on abstract/social topics linked to Part 2 theme.
Expected response for THIS question: 30–50 seconds with opinion, reasoning, and examples.
Fluency: smooth delivery of complex ideas; discourse markers and hedging language expected at higher bands.
PENALISE vague, very short (under 20 seconds), or surface-level answers.
Lexical/Grammar: highest standard – wide range, complex structures, precise vocabulary required for high bands.`
}

export const RUBRIC = `
═══════════════════════════════════════════════
CRITERION 1: FLUENCY & COHERENCE
Key dimensions: speech continuity, hesitation TYPE, repetition/self-correction, discourse markers (range + appropriacy), coherence & topic development.

Band 9: Fluent, rare repetition/self-correction. Hesitation content-related only. Fully coherent throughout. Topics developed fully and logically.
Band 8: Fluent. Hesitations mainly content-related, rarely language-related. Occasional repetition/self-correction. Wide range of connectives & discourse markers, used flexibly.
Band 7: Speaks at length without noticeable effort. SOME hesitation (occasionally language-related), some repetition/self-correction without loss of coherence. Wide flexible connectives & discourse markers.
Band 6: Able and willing to speak at length. Loses coherence AT TIMES due to repetition, self-correction, or hesitation. Range of connectives/discourse markers but NOT ALWAYS appropriately.
Band 5: Maintains flow via repetition, self-correction, or slowing. Hesitations often to search for BASIC lexis or grammar. May OVERUSE certain connectives. Fluent in simple speech; struggles with complex content.
Band 4: Noticeably slow, frequent pauses. Frequent repetition/self-correction. Only simple repetitive connectives. Frequent coherence breakdowns.

CRITICAL DECISION RULE – hesitation type determines band 6 vs 7 vs 8:
- [PAUSE] BETWEEN full sentences/ideas → content hesitation → Band 7–8
- [PAUSE] MID-SENTENCE before/after a content word or filler → language search → Band 5–6

═══════════════════════════════════════════════
CRITERION 2: LEXICAL RESOURCE
Key dimensions: range (familiar vs unfamiliar topics), flexibility & precision, collocations & idioms, paraphrase ability.

Band 9: Full flexibility and precision across all topics. Idioms used naturally and accurately.
Band 8: Wide flexible vocabulary. Less-common words & idioms skillfully used (occasional collocation errors). Effective paraphrase. Precise meaning.
Band 7: Flexible vocabulary across many topics. SOME less-common words & idioms, collocation awareness (not always ideal). Paraphrases effectively in multiple ways.
Band 6: Wide enough range for extended discussion. Word choices may be inappropriate but meaning CLEAR. Generally successful paraphrase.
Band 5: Sufficient for familiar AND unfamiliar topics but LIMITED flexibility. Paraphrase with MIXED success.
Band 4: Sufficient for FAMILIAR topics only. Basic meaning only on unfamiliar topics. Frequent word choice errors. RARELY attempts paraphrase.

═══════════════════════════════════════════════
CRITERION 3: GRAMMATICAL RANGE & ACCURACY
Key dimensions: range of structures (basic → complex → wide), accuracy of basic vs complex structures, error impact on communication.

Band 9: Consistently accurate. Only very minor native-speaker slips.
Band 8: Wide range of structures, used flexibly. Majority of sentences error-free. Very occasional inappropriacies.
Band 7: Range of complex structures with flexibility. Frequently error-free sentences. Only some errors.
Band 6: Mix of simple and complex structures, less flexible. Frequent errors in complex structures but RARELY cause comprehension problems.
Band 5: Mostly basic forms with reasonable accuracy. Limited complex structures; usually contain errors when attempted.
Band 4: Basic forms only, some correct. Rarely uses subordinate clauses. Short repetitive utterances. Frequent errors.

Error severity:
Band 7–9: errors do not affect communication
Band 6: complex-structure errors rarely cause comprehension problems
Band 5: complex-structure errors cause SOME comprehension problems
Band 4: errors frequently lead to misunderstanding

═══════════════════════════════════════════════
CRITERION 4: PRONUNCIATION
Key dimensions: phoneme accuracy, intonation, connected speech/linking, rhythm, intelligibility, sustainability of control.

Band 9: Full range of phonological features, accurate and subtle throughout. Effortless to understand.
Band 8: Wide range of features with precision. Sustains rhythm, stress & intonation on long utterances (occasional lapses). Easy to understand throughout.
Band 7: All positive features of Band 6 + some (not all) of Band 8.
Band 6: Range of features but CONTROL NOT SUSTAINED. Phrase-linking present but rhythm affected. Generally intelligible despite occasional unclear words.
Band 5: All positive features of Band 4 + some (not all) of Band 6.
Band 4: Some intonation & stress but LIMITED control. Frequent mispronunciation causes listener difficulty.

HARD BAND FLOOR ANCHORS — strictly binding, override all other judgement:
- avgPhonemeScore ≥ 95 AND prosodyScore ≥ 80 → band CANNOT be lower than 8.0
- avgPhonemeScore ≥ 90 AND prosodyScore ≥ 75 → band CANNOT be lower than 7.5
- avgPhonemeScore ≥ 85 AND prosodyScore ≥ 70 → band CANNOT be lower than 7.0
- avgPhonemeScore 70–84 → Band 5–6 range
- avgPhonemeScore < 70 → Band 4 range

STT ARTIFACT WARNING:
- Words at sentence/phrase END with low score are often STT mismatches, not real errors.
- If mispronounced word's context is incoherent in transcript (e.g. "kindness and down are") — assume STT artifact, do NOT cite as pronunciation error.
- Only cite words where: (1) score < 60 AND (2) the surrounding transcript context is coherent.

Sustainability: Band 4 = frequent lapses | Band 6 = effective but not sustained | Band 8 = sustained with occasional lapses | Band 9 = fully sustained
═══════════════════════════════════════════════`
