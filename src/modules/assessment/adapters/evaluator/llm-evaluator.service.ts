import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ILLMProvider } from '../llm/llm.provider.interface'
import { AssessmentWord, Evaluation, SpeechAnalysis } from '~/modules/practice/attempt/attempt.model'

import { EvaluatorPromptBuilder } from './evaluator-prompt.builder'
import { EvaluatorResponseParser } from './evaluator-response.parser'
export type EvaluateInput = {
  transcript: string
  question: string
  part: number
  speechAnalysis: SpeechAnalysis
  assessmentWords?: AssessmentWord[]
}

export type EvaluatorOutput = {
  evaluation: Evaluation
  warnings: string[]
  isValid: boolean
}

@singleton()
export class LLMEvaluator {
  constructor(
    @inject(TOKENS.ILLMProvider) private readonly llmProvider: ILLMProvider,
    private readonly promptBuilder: EvaluatorPromptBuilder,
    private readonly responseParser: EvaluatorResponseParser
  ) {}

  public async evaluate(input: EvaluateInput): Promise<EvaluatorOutput> {
    const prompt = this.promptBuilder.build(input)
    const raw = await this.llmProvider.complete(prompt)
    return this.responseParser.parse(raw, input)
  }
}
