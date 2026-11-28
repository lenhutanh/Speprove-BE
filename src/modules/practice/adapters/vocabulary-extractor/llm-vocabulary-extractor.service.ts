import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ILLMProvider } from '../../../assessment/adapters/llm/llm.provider.interface'
import {
  ExtractedVocabularyItem,
  IVocabularyExtractor,
  VocabularyExtractionInput
} from './vocabulary-extractor.service.interface'
import { VocabularyExtractionPromptBuilder } from './vocabulary-extraction-prompt.builder'
import { VocabularyExtractionResponseParser } from './vocabulary-extraction-response.parser'

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
