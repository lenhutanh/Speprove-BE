import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ILLMProvider } from '../llm/llm.interface'
import {
  ExtractedVocabularyItem,
  IVocabularyExtractor,
  VocabularyExtractionInput
} from './vocabulary-extractor.interface'
import { VocabularyExtractionPromptBuilder } from './prompt.builder'
import { VocabularyExtractionResponseParser } from './response.parser'

@singleton()
export class LLMVocabularyExtractor implements IVocabularyExtractor {
  constructor(
    @inject(TOKENS.ILLMProvider)
    private readonly llmProvider: ILLMProvider,
    private readonly promptBuilder: VocabularyExtractionPromptBuilder,
    private readonly responseParser: VocabularyExtractionResponseParser
  ) {}

  public async extract(input: VocabularyExtractionInput): Promise<ExtractedVocabularyItem[]> {
    const prompt = this.promptBuilder.build(input)
    const raw = await this.llmProvider.complete(prompt)
    return this.responseParser.parse(raw)
  }
}
