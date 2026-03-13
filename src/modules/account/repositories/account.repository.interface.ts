import { IBaseRepository } from '~/common/base/base.repository.interface'
import { AccountType } from '../account.model'

export interface IAccountRepository extends IBaseRepository<AccountType> {
  findByEmailWithPassword(email: string): Promise<AccountType | null>
  getAccountWithPermissions(id: string): Promise<AccountType | null>
}
