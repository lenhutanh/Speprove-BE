import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { VocabularySuggestionType } from './vocabulary-suggestion.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IVocabularySuggestionRepository extends IBaseRepository<VocabularySuggestionType> {}
