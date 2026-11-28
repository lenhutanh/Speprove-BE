import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { AttemptAnalysisRepository } from '../../assessment/attempt-analysis.repository'
import { AttemptRepository } from './attempt.repository'

export const registerAttemptModule = () => {
  container.registerSingleton(TOKENS.IAttemptRepository, AttemptRepository)
  container.registerSingleton(TOKENS.IAttemptAnalysisRepository, AttemptAnalysisRepository)
}
