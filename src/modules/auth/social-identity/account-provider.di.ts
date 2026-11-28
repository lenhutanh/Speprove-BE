import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { AccountProviderRepository } from './account-provider.repository'

export const registerAccountProviderModule = () => {
  container.registerSingleton(TOKENS.IAccountProviderRepository, AccountProviderRepository)
}
