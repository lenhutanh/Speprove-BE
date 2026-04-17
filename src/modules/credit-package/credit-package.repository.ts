import { BaseRepository } from '~/common/base'
import { CreditPackage, CreditPackageType } from './credit-package.model'
import { ICreditPackageRepository } from './credit-package.repository.interface'

export class CreditPackageRepository extends BaseRepository<CreditPackageType> implements ICreditPackageRepository {
  constructor() {
    super(CreditPackage)
  }
}
