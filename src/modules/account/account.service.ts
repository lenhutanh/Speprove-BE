import { StatusCodes } from 'http-status-codes'
import { Account, AccountType } from '~/modules/account/account.model'
import { FREE_SIGNUP_BALANCE, GROUP_NAME, LOGIN_PROVIDER, STATUS } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { GroupService } from '../group/group.service'
import { TOKENS } from '~/common/constants/tokens'
import { IAccountRepository } from './repositories/account.repository.interface'
import { AppError } from '~/common/errors'
import { VoiceService } from '../voice/voice.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { UserInfoGoogleDto } from '../auth/types/google.type'
import { toObjectId } from '~/common/utils'

@singleton()
export class AccountService {
  constructor(
    private readonly groupService: GroupService,
    @inject(TOKENS.IAccountRepository) private readonly accountRepository: IAccountRepository,
    private readonly voiceService: VoiceService
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
    const [group, defaultVoice] = await Promise.all([
      this.groupService.findByName(GROUP_NAME.USER),
      this.voiceService.getDefault()
    ])

    if (!group) {
      throw new AppError('Default user group not found', StatusCodes.INTERNAL_SERVER_ERROR)
    }
    const newData = {
      ...data,
      username: data.email.split('@')[0],
      status: STATUS.ACTIVE,
      groupId: group._id,
      selectedVoiceId: defaultVoice.id,
      balance: FREE_SIGNUP_BALANCE,
      provider: LOGIN_PROVIDER.LOCAL
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

  public async addBalance(userId: string, amount: number, session: any) {
    const updated = await this.accountRepository.addBalance(userId, amount, session)
    if (!updated) throw new AppError('Account not found', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    return updated
  }

  public async deductBalance(userId: string, amount: number, session: any) {
    const updated = await this.accountRepository.deductBalance(userId, amount, session)
    if (!updated) throw new AppError('Insufficient balance', StatusCodes.BAD_REQUEST, ErrorCodes.INSUFFICIENT_BALANCE)
    return updated
  }

  public async updatePassword(email: string, password: string) {
    const updated = await this.accountRepository.updateOne({ email }, { password })
    if (!updated) throw new AppError('Account not found', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    return updated
  }

  public async createUserSocial(userInfo: UserInfoGoogleDto) {
    const [group, defaultVoice] = await Promise.all([
      this.groupService.findByName(GROUP_NAME.USER),
      this.voiceService.getDefault()
    ])

    if (!group) {
      throw new AppError('Default user group not found', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const newData = {
      email: userInfo.email,
      fullName: userInfo.fullName,
      username: userInfo.email.split('@')[0],
      status: STATUS.ACTIVE,
      groupId: group._id,
      selectedVoiceId: toObjectId(defaultVoice.id),
      balance: FREE_SIGNUP_BALANCE,
      provider: LOGIN_PROVIDER.GOOGLE,
      providerId: userInfo.providerId
    }

    return await this.accountRepository.create(newData)
  }
}
