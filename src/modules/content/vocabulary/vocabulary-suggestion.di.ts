import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { VocabularySuggestionRepository } from './vocabulary-suggestion.repository'

export const registerVocabularySuggestionModule = () => {
  container.registerSingleton(TOKENS.IVocabularySuggestionRepository, VocabularySuggestionRepository)
}
