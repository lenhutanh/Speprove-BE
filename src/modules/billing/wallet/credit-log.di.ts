import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { CreditLogRepository } from './credit-log.repository'

export const registerCreditLogModule = () => {
  container.registerSingleton(TOKENS.ICreditLogRepository, CreditLogRepository)
}
