import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { CreditPackageType } from './credit-package.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreditPackageRepository extends IBaseRepository<CreditPackageType> {}
