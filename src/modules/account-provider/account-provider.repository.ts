import { BaseRepository } from '~/common/base'
import { IAccountProviderRepository } from './account-provider.repository.interface'
import { AccountProvider, AccountProviderType } from './account-provider.model'

export class AccountProviderRepository
  extends BaseRepository<AccountProviderType>
  implements IAccountProviderRepository
{
  constructor() {
    super(AccountProvider)
  }
}
