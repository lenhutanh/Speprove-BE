import { BaseRepository } from '~/common/base'
import { VocabularySuggestion, VocabularySuggestionType } from './vocabulary-suggestion.model'
import { IVocabularySuggestionRepository } from './vocabulary-suggestion.repository.interface'

export class VocabularySuggestionRepository
  extends BaseRepository<VocabularySuggestionType>
  implements IVocabularySuggestionRepository
{
  constructor() {
    super(VocabularySuggestion)
  }
}
