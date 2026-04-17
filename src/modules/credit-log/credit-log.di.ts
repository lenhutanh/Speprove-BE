import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { CreditLogRepository } from './credit-log.repository'

export const registerCreditLogModule = () => {
  container.registerSingleton(TOKENS.ICreditLogRepository, CreditLogRepository)
}
