import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ICreditLogRepository } from './credit-log.repository.interface'

@singleton()
export class CreditLogService {
  constructor(
    @inject(TOKENS.ICreditLogRepository)
    private readonly creditLogRepository: ICreditLogRepository
  ) {}

  public async create(data: any, session: any) {
    return await this.creditLogRepository.create(data, { session })
  }
}
