import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { AttemptRepository } from './attempt.repository'

export const registerAttemptModule = () => {
  container.registerSingleton(TOKENS.IAttemptRepository, AttemptRepository)
}
