import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { AccountProviderType } from './account-provider.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAccountProviderRepository extends IBaseRepository<AccountProviderType> {}
