import { BaseRepository } from '~/common/base/base.repository'
import { Account, AccountType } from '../account.model'
import { IAccountRepository } from './account.repository.interface'

export class AccountRepository extends BaseRepository<AccountType> implements IAccountRepository {
  constructor() {
    super(Account)
  }

  async findByEmailWithPassword(email: string): Promise<AccountType | null> {
    return this.model
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate({
        path: 'groupId',
        populate: { path: 'permissionIds' }
      })
      .lean()
      .exec()
  }

  async getAccountWithPermissions(id: string): Promise<AccountType | null> {
    return this.model
      .findById(id)
      .select('-password')
      .populate({
        path: 'groupId',
        populate: { path: 'permissionIds' }
      })
      .lean()
      .exec()
  }
}
