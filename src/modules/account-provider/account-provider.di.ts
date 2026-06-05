import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { AccountProviderRepository } from './account-provider.repository'

export const registerAccountProviderModule = () => {
  container.registerSingleton(TOKENS.IAccountProviderRepository, AccountProviderRepository)
}

