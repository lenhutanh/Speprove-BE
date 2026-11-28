import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { AccountRepository } from './account.repository'

export const registerAccountModule = () => {
  container.registerSingleton(TOKENS.IAccountRepository, AccountRepository)
}
