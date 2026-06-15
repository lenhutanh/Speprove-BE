import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { VocabularySuggestionRepository } from './vocabulary-suggestion.repository'

export const registerVocabularySuggestionModule = () => {
  container.registerSingleton(TOKENS.IVocabularySuggestionRepository, VocabularySuggestionRepository)
}
