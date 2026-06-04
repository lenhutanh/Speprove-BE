import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { VocabularySuggestionRepository } from './vocabulary-suggestion.repository'

export const registerVocabularySuggestionModule = () => {
  container.registerSingleton(TOKENS.IVocabularySuggestionRepository, VocabularySuggestionRepository)
}
