import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { CreditPackageRepository } from './credit-package.repository'

export const registerCreditPackageModule = () => {
  container.registerSingleton(TOKENS.ICreditPackageRepository, CreditPackageRepository)
}
