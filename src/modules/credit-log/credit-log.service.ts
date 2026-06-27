import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ICreditLogRepository } from './credit-log.repository.interface'
import { GetListCreditLogQuery } from './credit-log.type'
import { QueryBuilder } from '~/common/base'
import { CreditLogType } from './credit-log.model'
import { CreditLogMapper } from './credit-log.mapper'

@singleton()
export class CreditLogService {
  constructor(
    @inject(TOKENS.ICreditLogRepository)
    private readonly creditLogRepository: ICreditLogRepository,
    private readonly creditLogMapper: CreditLogMapper
  ) {}

  public async create(data: any, session: any) {
    if (data.amount !== undefined) {
      data.amount = Math.abs(data.amount)
    }
    return await this.creditLogRepository.create(data, { session })
  }

  public async getList(userId: string, query: GetListCreditLogQuery) {
    const { limit, page, sortBy, sortOrder, search, ...filters } = query
    const qb = new QueryBuilder<CreditLogType>()

    const { filter, options } = qb
      .applyFilters({ userId, ...filters })
      .search(['description'], search || '')
      .sort(sortBy, 'desc')
      .build()

    const { data, pagination } = await this.creditLogRepository.paginate(filter, page, limit, options)

    return {
      data: this.creditLogMapper.toResponseList(data),
      pagination
    }
  }
}
