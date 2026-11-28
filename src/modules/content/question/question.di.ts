import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { QuestionRepository } from './question.repository'

export const registerQuestionModule = () => {
  container.registerSingleton(TOKENS.IQuestionRepository, QuestionRepository)
}
