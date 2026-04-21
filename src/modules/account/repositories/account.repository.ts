import { BaseRepository } from '~/common/base/base.repository'
import { Account, AccountType } from '../account.model'
import { IAccountRepository } from './account.repository.interface'
import { ClientSession } from 'mongoose'

export class AccountRepository extends BaseRepository<AccountType> implements IAccountRepository {
  constructor() {
    super(Account)
  }

  public async addBalance(userId: string, amount: number, session: ClientSession): Promise<AccountType | null> {
    return await this.updateById(userId, { $inc: { balance: amount } }, { session })
  }

  public async deductBalance(userId: string, amount: number, session: ClientSession): Promise<AccountType | null> {
    return await this.updateOne({ _id: userId, balance: { $gte: amount } }, { $inc: { balance: -amount } }, { session })
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
