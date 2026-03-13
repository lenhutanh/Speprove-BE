import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { QuestionRepository } from './repositories/question.repository'

export const registerQuestionModule = () => {
  container.registerSingleton(TOKENS.IQuestionRepository, QuestionRepository)
}
