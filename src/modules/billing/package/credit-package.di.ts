import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { CreditPackageRepository } from './credit-package.repository'

export const registerCreditPackageModule = () => {
  container.registerSingleton(TOKENS.ICreditPackageRepository, CreditPackageRepository)
}
