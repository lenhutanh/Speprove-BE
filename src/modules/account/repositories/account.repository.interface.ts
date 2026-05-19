import { IBaseRepository } from '~/common/base/base.repository.interface'
import { AccountType } from '../account.model'
import { ClientSession } from 'mongoose'

export interface IAccountRepository extends IBaseRepository<AccountType> {
  findByEmail(email: string): Promise<AccountType | null>
  findByEmailForLogin(email: string): Promise<AccountType | null>
  findByEmailForToken(email: string): Promise<AccountType | null>
  getAccountWithPermissions(id: string): Promise<AccountType | null>
  deductBalance(userId: string, amount: number, session: ClientSession): Promise<AccountType | null>
  addBalance(userId: string, amount: number, session: ClientSession): Promise<AccountType | null>
}
