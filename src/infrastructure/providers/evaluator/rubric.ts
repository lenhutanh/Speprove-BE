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

export const COHERENCE_RUBRIC = `Coherence band anchors, adapted from IELTS Speaking Fluency and Coherence descriptors for content and organization only:
Band 9: Response is fully relevant, situationally appropriate, logically organized, and appropriately extended. Cohesive features are natural and fully acceptable.
Band 8: Topic development is coherent, appropriate, and relevant. Ideas are clearly connected and sufficiently developed for the task.
Band 7: Ideas are clear and mostly well connected. Spoken discourse markers, connectives, and cohesive features are used flexibly. Minor lapses do not affect coherence.
Band 6: Response is generally relevant and can be followed, but coherence may be lost at times. Connectives and cohesive features are used, though not always appropriately.
Band 5: Basic message is usually understandable, but development is limited, repetitive, or uneven. Discourse markers/connectives may be overused or mechanical.
Band 4: Can link simple ideas, but links are often repetitive or unclear. Some coherence breakdowns occur and topic development is limited.
Band 3: Limited ability to link simple ideas or go beyond simple responses. The basic message is often unclear.
Band 2: Isolated words or memorised fragments have very little communicative significance.
Band 1: Speech is totally incoherent or has no rateable content.`

export const LEXICAL_RUBRIC = `Lexical Resource band anchors, based on IELTS Speaking descriptors:
Band 9: Total flexibility and precise vocabulary in all contexts. Sustained accurate and idiomatic language.
Band 8: Wide vocabulary, readily and flexibly used to discuss all topics and convey precise meaning. Skilful less-common/idiomatic items with only occasional word choice or collocation inaccuracies. Effective paraphrase.
Band 7: Vocabulary is flexibly used across topics. Some less-common/idiomatic items and awareness of style/collocation, though inappropriacies occur. Effective paraphrase.
Band 6: Vocabulary is sufficient to discuss topics at length. Some inappropriate word choice may occur but meaning is clear. Generally successful paraphrase.
Band 5: Vocabulary covers familiar and unfamiliar topics but flexibility is limited. Attempts paraphrase with mixed success.
Band 4: Vocabulary is enough for familiar topics, but only basic meaning on unfamiliar topics. Frequent word choice errors. Rare paraphrase.
Band 3: Simple vocabulary mainly for personal information. Inadequate for unfamiliar topics.
Band 2: Very limited vocabulary; mostly isolated or memorised words.
Band 1: No lexical resource beyond a few isolated words.
Lexical issues should target word choice, collocation, word form, register, idiom, or imprecise vocabulary that is clearly unnatural or inaccurate in spoken English. Do not report spelling, capitalization, punctuation, or hyphenation-only issues.`

export const GRAMMAR_RUBRIC = `Grammatical Range and Accuracy band anchors, based on IELTS Speaking descriptors:
Band 9: Structures are precise and accurate except for native-speaker-like slips.
Band 8: Wide range of structures used flexibly. Most sentences are error-free. Occasional non-systematic errors or inappropriacies.
Band 7: A range of structures used flexibly. Error-free sentences are frequent. Simple and complex sentences are effective despite some errors.
Band 6: Mix of short and complex sentence forms with variety but limited flexibility. Errors occur frequently in complex structures but rarely impede communication.
Band 5: Basic sentence forms are fairly well controlled. Complex structures are limited, usually contain errors, and may require reformulation.
Band 4: Basic sentence forms and some short error-free utterances. Subordinate clauses are rare; turns are short, repetitive, and error-prone.
Band 3: Basic sentence forms are attempted but grammatical errors are numerous except in memorised utterances.
Band 2: No evidence of basic sentence forms.
Band 1: No rateable grammar unless memorised.
Grammar issues should target spoken structure: tense, agreement, articles, prepositions, word order, clause structure, and missing required sentence elements. Do not report errors that depend only on written sentence boundaries or punctuation.`
