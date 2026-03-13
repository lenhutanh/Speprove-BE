import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { AccountRepository } from './repositories/account.repository'

export const registerAccountModule = () => {
  container.registerSingleton(TOKENS.IAccountRepository, AccountRepository)
}
