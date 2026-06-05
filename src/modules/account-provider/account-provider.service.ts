import { inject, singleton } from 'tsyringe'
import { IAccountProviderRepository } from './account-provider.repository.interface'
import { TOKENS } from '~/common/constants/di.tokens'
import { LoginProviderType } from '~/modules/auth/auth.constants'

@singleton()
export class AccountProviderService {
  constructor(
    @inject(TOKENS.IAccountProviderRepository)
    private readonly accountProviderRepository: IAccountProviderRepository
  ) {}

  public async findByProvider(providerId: string, provider: LoginProviderType) {
    return await this.accountProviderRepository.findOne({ providerId, provider })
  }

  public async create(data: any, session?: any) {
    return await this.accountProviderRepository.create(data, { session })
  }
}

