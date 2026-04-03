import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ILLMProvider } from '../llm/llm.interface'
import { Evaluation, SpeechMetrics } from '~/modules/attempt/attempt.model'

import { EvaluatorPromptBuilder } from './prompt.builder'
import { EvaluatorResponseParser } from './response.parser'
export type EvaluateInput = {
  transcript: string
  question: string
  part: number
  speechMetrics: SpeechMetrics
}

@singleton()
export class LLMEvaluator {
  constructor(
    @inject(TOKENS.ILLMProvider) private readonly llmProvider: ILLMProvider,
    private readonly promptBuilder: EvaluatorPromptBuilder,
    private readonly responseParser: EvaluatorResponseParser
  ) {}

  public async evaluate(input: EvaluateInput): Promise<Evaluation> {
    const prompt = this.promptBuilder.build(input)
    const raw = await this.llmProvider.complete(prompt)
    return this.responseParser.parse(raw, input)
  }
}
