import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { QuestionAudioRepository } from './question-audio.repository'

export const registerQuestionAudioModule = () => {
  container.registerSingleton(TOKENS.IQuestionAudioRepository, QuestionAudioRepository)
}
