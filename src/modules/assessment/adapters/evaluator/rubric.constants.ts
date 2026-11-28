export const PART_GUIDANCE: Record<number, string> = {
  1: `IELTS Speaking Part 1 - Introduction and interview.
- Expected response for one question: usually short, direct, personal, and natural.
- Coherence: a concise answer can score well when it directly answers the question and gives enough support for that question type. Closed/simple questions may need only a direct answer plus one brief reason or concrete detail.
- Do not penalise a 2-4 sentence answer only for being short. Flag coherence only when the answer is too short to communicate meaning, does not answer directly, lacks needed support, becomes repetitive, or goes off topic.
- Lexical: familiar-topic vocabulary is acceptable; prefer natural spoken English over formal or academic wording. A concise Part 1 answer can still show high lexical control when vocabulary is precise, natural, flexible, and appropriate for the question.
- Grammar: accurate basic and intermediate structures are enough for a good score if errors are limited. A concise Part 1 answer can still show high grammatical control when the produced clauses are mostly error-free and include flexible spoken structures appropriate for the question.
- Do not require a Part 1 answer to demonstrate the same breadth of vocabulary or grammar as a Part 2 long turn or a Part 3 discussion.`,

  2: `Part 2 scoring guidance:
- Task context: IELTS Speaking Part 2 - Individual long turn / cue card.
- Expected response: a developed monologue that addresses the prompt and cue points.
- Coherence: consider cue coverage, sequence of ideas, development, and whether the response feels like a sustained long turn.
- Use only the provided cue card/question to judge cue coverage. Do not invent missing cue points.
- Penalise missing or underdeveloped cue points when they make the answer feel incomplete, but do not require every minor detail to be equally expanded.
- Lexical: expect enough range to describe details, feelings, reasons, examples, and changes over time where relevant.
- Grammar: expect more sentence variety than Part 1, but judge errors by their impact on communication.
- Suggestions should help the speaker extend or organise the answer, not only correct isolated phrases.`,

  3: `Part 3 scoring guidance:
- Task context: IELTS Speaking Part 3 - Two-way discussion.
- Expected response: a more developed answer with opinion, reasoning, examples, and some abstract/general discussion.
- Coherence: expect deeper development than Part 1, with reasoning, examples, comparison, cause/effect, or qualification where relevant.
- Strong Part 3 answers usually include at least two forms of development, such as explanation, example, comparison, cause/effect, or qualification.
- If the answer only gives a simple opinion plus a surface-level reason, coherence should usually not exceed Band 6.
- Lexical: expect more precise vocabulary for abstract or social topics. Surface-level development may limit lexical evidence even if individual word choices are accurate.
- Grammar: reward flexible complex structures; penalise repetitive simple forms or frequent errors.`
}

export const TRANSCRIPT_SCORING_GUIDANCE = `Transcript handling guidance:
- Treat the transcript as spoken STT text, not edited writing.
- Punctuation is included only to make the transcript easier to read and may be imperfect. Do not penalise punctuation, capitalization, sentence breaks, or run-on formatting.
- Do not create lexical or grammar issues for punctuation, capitalization, hyphenation, comma placement, sentence splitting, or display formatting when spoken meaning is clear.
- Judge spoken English. Accept natural elliptical answers, discourse fragments, fillers, repairs, and conversational phrasing when meaning is clear.
- Do not require every spoken response to be a complete written sentence, but do not excuse errors that clearly break grammar, meaning, or natural spoken English.
- Do not use sentence segmentation as grammar evidence. Use the word sequence and spoken meaning.
- Do not report minor parallelism, formal wording, or written-style improvements as grammar issues in natural spoken English.
- Do not create grammar issues for simple stutters or immediate one-word repetitions; delivery mechanics are handled by the backend.
- Natural fillers such as "you know", "like", or "I mean" are acceptable unless they obscure meaning or create real coherence problems.
- Ignore harmless display-format differences such as abbreviations or capitalization when the intended word is clear.
- Do not report hyphenation-only issues such as "floor to ceiling" versus "floor-to-ceiling"; that is written formatting, not speaking performance.
- Repeated words are delivery evidence unless they make the message hard to follow; do not classify one-word repetition as grammar.`

export const FLUENCY_COHERENCE_RUBRIC = `Fluency and Coherence (FC) band anchors, based on IELTS Speaking descriptors:
Band 9: Speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar. Speaks coherently with fully appropriate cohesive features. Develops topics fully and appropriately. Speech is situationally appropriate and cohesive features are fully acceptable.
Band 8: Speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language. Develops topics coherently and appropriately. Hesitation may occasionally be used to find words or grammar, but most will be content related. Topic development is coherent, appropriate and relevant.
Band 7: Speaks at length without noticeable effort or loss of coherence. Some hesitation, repetition and/or self-correction may occur, often mid-sentence and indicate problems with accessing appropriate language. However, these will not affect coherence. Uses a range of connectives and discourse markers with some flexibility. Progression of ideas is generally clear and logical.
Band 6: Able to keep going and demonstrates a willingness to produce long turns, though may lose coherence at times due to occasional repetition, self-correction or hesitation. Uses a range of connectives and discourse markers but not always appropriately. Logical progression of ideas is generally present but may break down.
Band 5: Usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going. May over-use certain connectives and discourse markers. Produces simple speech fluently, but more complex communication causes fluency problems.
Band 4: Cannot respond without noticeable pauses and may speak slowly with frequent repetition. Links basic sentences but with difficulty developing ideas and/or maintaining progression.
Band 3: Speaks with long pauses and has limited ability to link simple sentences. Gives only simple responses and cannot convey basic message.
Band 2: Pauses constantly and has very little communication.
Band 1: No rateable language.`

export const LEXICAL_RUBRIC = `Lexical Resource band anchors, based on IELTS Speaking descriptors:
Band 9: Total flexibility and precise use in all contexts. Sustained use of accurate and idiomatic language.
Band 8: Wide vocabulary, readily and flexibly used to discuss all topics and convey precise meaning. Skilful use of less common and idiomatic items despite occasional inaccuracies in word choice and collocation. Effective use of paraphrase as required.
Band 7: Uses vocabulary resource flexibly to discuss a variety of topics. Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices. Uses paraphrase effectively.
Band 6: Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies. Generally paraphrases successfully.
Band 5: Vocabulary covers familiar and unfamiliar topics but flexibility is limited. Attempts paraphrase with mixed success.
Band 4: Vocabulary is enough for familiar topics, but only basic meaning on unfamiliar topics. Frequent word choice errors. Rarely attempts paraphrase.
Band 3: Simple vocabulary mainly for personal information. Inadequate for unfamiliar topics.
Band 2: Very limited vocabulary; mostly isolated or memorised words.
Band 1: No lexical resource beyond a few isolated words.
Lexical issues should target word choice, collocation, word form, register, idiom, or imprecise vocabulary that is clearly unnatural or inaccurate in spoken English. Do not report spelling, capitalization, punctuation, or hyphenation-only issues.`

export const GRAMMAR_RUBRIC = `Grammatical Range and Accuracy band anchors, based on IELTS Speaking descriptors:
Band 9: Uses a full range of structures naturally and appropriately. Produces consistently accurate structures apart from 'slips' characteristic of native speaker speech.
Band 8: Uses a wide range of structures flexibly. Most sentences are error-free. Occasional non-systematic errors or inappropriacies.
Band 7: Uses a range of complex structures with some flexibility. Frequently produces error-free sentences, though some grammatical errors persist.
Band 6: Mix of short and complex sentence forms with variety but limited flexibility. Errors occur frequently in complex structures but rarely impede communication.
Band 5: Basic sentence forms are fairly well controlled for accuracy. Complex structures are attempted but these are limited in range, nearly always contain errors and may lead to the need for reformulation.
Band 4: Can produce basic sentence forms and some short utterances are error-free. Subordinate clauses are rare and, overall, turns are short, structures are repetitive and errors are frequent.
Band 3: Basic sentence forms are attempted but grammatical errors are numerous except in apparently memorised utterances.
Band 2: No evidence of basic sentence forms.
Band 1: No rateable grammar unless memorised.
Grammar issues should target spoken structure: tense, agreement, articles, prepositions, word order, clause structure, and missing required sentence elements. Do not report errors that depend only on written sentence boundaries or punctuation.`
