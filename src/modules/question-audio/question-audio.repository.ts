import { BaseRepository } from '~/common/base/base.repository'
import { IQuestionAudioRepository } from './question-audio.repository.interface'
import { QuestionAudio, QuestionAudioType } from './question-audio.model'

export class QuestionAudioRepository extends BaseRepository<QuestionAudioType> implements IQuestionAudioRepository {
  constructor() {
    super(QuestionAudio)
  }
}
