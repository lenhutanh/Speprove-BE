import { singleton } from 'tsyringe'
import { EvaluateInput } from './llm-evaluator'
import { COHERENCE_RUBRIC, GRAMMAR_RUBRIC, LEXICAL_RUBRIC, PART_GUIDANCE, TRANSCRIPT_SCORING_GUIDANCE } from './rubric'

@singleton()
export class EvaluatorPromptBuilder {
  public build(input: EvaluateInput): string {
    return `You are an IELTS Speaking examiner. Score only the content-based criteria requested below.
Return valid JSON only. Vietnamese explanations must be concise and must use Vietnamese only.
Specific words, phrases, and suggestions must stay in English.

Part guidance:
${PART_GUIDANCE[input.part]}

Transcript scoring guidance:
${TRANSCRIPT_SCORING_GUIDANCE}

Question / cue card:
${input.question}

Evaluation transcript:
This transcript is built from Azure word-level assessment and uses punctuation aligned from the STT display transcript for readability. It is the only transcript source for scoring.
${input.transcript}

IELTS rubric reference for criteria you must score:
${COHERENCE_RUBRIC}

${LEXICAL_RUBRIC}

${GRAMMAR_RUBRIC}

Scoring scope:
- Do not score pronunciation. The backend will score pronunciation from Azure speech assessment.
- Do not score fluency delivery mechanics. The backend handles pauses, speech rate, hesitation, fillers, simple stutters, and timing metrics.
- Score coherence from the question and evaluation transcript only: directness, relevance, idea development, logical progression, cohesive features, repeated ideas, and topic drift.
- Score lexical resource from the evaluation transcript.
- Score grammatical range and accuracy from the evaluation transcript.
- Criterion band values must be integers from 1 to 9. Do not return half bands for criteria.
- Overall half-band rounding is handled by the backend; do not return an overall score.

Transcript source policy:
- The evaluation transcript is the single source of truth for scoring and the only source for spanText.
- Punctuation is included only for readability and may be imperfect. Do not treat punctuation, capitalization, commas, hyphens, or sentence breaks as grammar, lexical, or coherence evidence.
- Judge the spoken words and meaning, not written punctuation.
- Do not mentally rewrite the transcript into polished writing before scoring. Judge the spoken word sequence as produced.
- If a possible issue depends only on where punctuation might be placed, do not report it.

Criterion boundaries:
- Classify each issue by its primary cause and communicative effect.
- Grammar: structural errors such as tense, subject-verb agreement, articles, required prepositions, word order, missing subject/verb, sentence structure, and clause structure.
- Lexical: word choice, collocation, register, idiom use, imprecise vocabulary, noun phrase naturalness, and word form/plurality when mainly lexical.
- Coherence: not answering the question, off-topic content, repeated ideas, weak development, unclear logic, contradiction, poor progression between ideas, and missing cue coverage.
- Attribute each local problem to one criterion only. If spans overlap, choose the single criterion that best explains the root cause and do not repeat it elsewhere.
- Use coherence for answer-level problems only. Do not use coherence to duplicate local grammar or lexical issues unless the local problem makes the overall message hard to understand.
- When a problem has mixed causes, prefer the most teachable primary cause: choose lexical for unnatural word choice or noun phrase construction, grammar for structural form errors, and coherence for idea development or logic.

Issue guidance:
- Default every issues array to [].
- Add issues only for concrete, actionable problems.
- Do not use issues as a general improvement list.
- Only add an issue when the problem is clearly wrong or noticeably unnatural in spoken English.
- A band may be limited by range, simplicity, or shortness even when issues is [].
- Do not flag a correct phrase only because a more advanced alternative exists.
- Do not add issues for optional improvements, more polished wording, or formal alternatives.
- Do not flag natural conversational wording unless it creates a clear word choice, grammar, coherence, or register problem.
- Keep issues focused: max 3 coherence issues, max 4 lexical issues, max 4 grammar issues.
- For lexical and grammar issues, spanText must be the shortest exact text from the evaluation transcript when possible.
- For coherence, omit spanText for global issues such as weak development, incomplete answers, or unclear overall organization. Use spanText only for a concrete repeated, off-topic, contradictory, or poorly connected phrase.
- Do not highlight a full sentence when a shorter word or phrase is enough.
- spanText must be copied from the evaluation transcript only.
- suggestion must be a direct replacement for spanText when spanText is present and must preserve the speaker's intended meaning.
- Reasons must be concise Vietnamese explanations and must accurately describe the problem.
- For countable nouns, explain singular/plural countability precisely; do not call countable nouns uncountable.
- severity must be "low", "medium", or "high".

Scoring calibration:
- Calibrate bands from the whole answer, not the worst local phrase. Consider range, accuracy, frequency of errors, severity, and impact on meaning.
- Lower grammar bands require a pattern of errors, repeated breakdowns, or errors that seriously affect understanding. One isolated local error in an otherwise controlled answer should not dominate the grammar band.
- Accept natural spoken English structures when they are understandable and normal in conversation, even if a more formal written version would be neater.
- Accuracy alone does not prove a high band. Simple, repetitive, or very limited language should not receive high lexical or grammar bands without enough evidence of flexible range.
- Limited evidence from a short response should make high lexical and grammar bands harder to justify, even when the response is accurate.
- Reward vocabulary for appropriacy, precision, flexibility, collocation control, idiomaticity, and natural spoken use. Conversational phrases and phrasal verbs can be strong lexical evidence when used well.
- Minor wording or collocation slips should be weighed against the overall lexical range and control; do not let a small number of minor slips erase otherwise strong performance.

Output schema:
{
  "coherence": {
    "band": number,
    "confidence": number,
    "issues": [
      {
        "spanText": "optional exact text from transcript",
        "suggestion": "optional practical improvement",
        "reason": "Vietnamese explanation",
        "severity": "low|medium|high"
      }
    ]
  },
  "lexical": {
    "band": number,
    "confidence": number,
    "issues": [
      {
        "spanText": "exact text from transcript",
        "suggestion": "better English word or phrase",
        "reason": "Vietnamese explanation",
        "severity": "low|medium|high"
      }
    ]
  },
  "grammar": {
    "band": number,
    "confidence": number,
    "issues": [
      {
        "spanText": "exact text from transcript",
        "suggestion": "corrected English phrase",
        "reason": "Vietnamese explanation",
        "severity": "low|medium|high"
      }
    ]
  }
}`
  }
}
