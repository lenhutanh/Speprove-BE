import { StatusCodes } from 'http-status-codes'
import { Account, AccountType } from '~/modules/account/account.model'
import { GROUP_NAME, STATUS } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { GroupService } from '../group/group.service'
import { TOKENS } from '~/common/constants/tokens'
import { IAccountRepository } from './repositories/account.repository.interface'
import { AppError } from '~/common/errors'

@singleton()
export class AccountService {
  constructor(
    private readonly groupService: GroupService,
    @inject(TOKENS.IAccountRepository) private readonly accountRepository: IAccountRepository
  ) {}

  public async getById(id: string): Promise<AccountType> {
    const account = await this.accountRepository.findById(id, {
      select: '-password',
      populate: 'groupId'
    })

    if (!account) throw new AppError('Account not found', StatusCodes.NOT_FOUND)
    return account
  }

  public async createUser(data: any) {
    const group = await this.groupService.findByName(GROUP_NAME.USER)
    if (!group) {
      throw new AppError('Default user group not found', StatusCodes.INTERNAL_SERVER_ERROR)
    }
    const newData = {
      ...data,
      username: data.email.split('@')[0],
      status: STATUS.ACTIVE,
      groupId: group._id
    }
    return await this.accountRepository.create(newData)
  }

  public async getList() {
    return await Account.find({}).select('-password').populate('group', 'name description')
  }

  public async getMe(id: string): Promise<AccountType> {
    const account = await this.accountRepository.getAccountWithPermissions(id)

    if (!account) {
      throw new AppError('Account not found', StatusCodes.NOT_FOUND)
    }

    return account
  }

  async findByEmail(email: string): Promise<AccountType | null> {
    return await this.accountRepository.findByEmailWithPassword(email)
  }
}
