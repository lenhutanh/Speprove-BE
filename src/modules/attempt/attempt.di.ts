import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { AttemptAnalysisRepository } from './attempt-analysis.repository'
import { AttemptRepository } from './attempt.repository'

export const registerAttemptModule = () => {
  container.registerSingleton(TOKENS.IAttemptRepository, AttemptRepository)
  container.registerSingleton(TOKENS.IAttemptAnalysisRepository, AttemptAnalysisRepository)
}
