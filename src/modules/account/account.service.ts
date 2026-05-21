import { StatusCodes } from 'http-status-codes'
import { Account, AccountType } from '~/modules/account/account.model'
import { FREE_SIGNUP_BALANCE, GROUP_NAME, STATUS } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { GroupService } from '../group/group.service'
import { TOKENS } from '~/common/constants/tokens'
import { IAccountRepository } from './repositories/account.repository.interface'
import { AppError } from '~/common/errors'
import { VoiceService } from '../voice/voice.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { AccountMapper } from './account.mapper'
import { UpdateProfileBodyType } from '../auth/types/auth.type'
import { UpdateSelectedVoiceBodyType } from './account.type'

@singleton()
export class AccountService {
  constructor(
    private readonly groupService: GroupService,
    @inject(TOKENS.IAccountRepository) private readonly accountRepository: IAccountRepository,
    private readonly voiceService: VoiceService,
    private readonly accountMapper: AccountMapper
  ) {}

  public async getById(id: string): Promise<AccountType> {
    const account = await this.accountRepository.findById(id, {
      select: '+password',
      populate: {
        path: 'groupId',
        populate: { path: 'permissionIds' }
      }
    })

    if (!account) throw new AppError('Account not found', StatusCodes.NOT_FOUND)
    return account
  }

  public async withTransaction<R>(callback: (session: any) => Promise<R>): Promise<R> {
    return await this.accountRepository.withTransaction(callback)
  }

  public async createUser(data: any, session?: any) {
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
      balance: FREE_SIGNUP_BALANCE
    }
    return await this.accountRepository.create(newData, { session })
  }

  public async getList() {
    return await Account.find({}).select('-password').populate('groupId', 'name description')
  }

  public async getMe(id: string) {
    const account = await this.accountRepository.getAccountWithPermissions(id)

    if (!account) {
      throw new AppError('Account not found', StatusCodes.NOT_FOUND)
    }

    return this.accountMapper.toResponse(account)
  }

  public async findByEmail(email: string): Promise<AccountType | null> {
    return await this.accountRepository.findByEmail(email)
  }

  public async findByEmailForLogin(email: string): Promise<AccountType | null> {
    return await this.accountRepository.findByEmailForLogin(email)
  }

  public async findByEmailForToken(email: string): Promise<AccountType | null> {
    return await this.accountRepository.findByEmailForToken(email)
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

  public async updateProfile(userId: string, data: UpdateProfileBodyType) {
    const updated = await this.accountRepository.updateById(userId, data)
    if (!updated) throw new AppError('Account not found', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    return this.getMe(userId)
  }

  public async updateSelectedVoice(userId: string, data: UpdateSelectedVoiceBodyType) {
    const voice = await this.voiceService.findActiveById(data.selectedVoiceId)
    const updated = await this.accountRepository.updateById(userId, { selectedVoiceId: voice._id })
    if (!updated) throw new AppError('Account not found', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
  }
}
