import { BaseRepository } from '~/common/base'
import { CreditLog, CreditLogType } from './credit-log.model'
import { ICreditLogRepository } from './credit-log.repository.interface'

export class CreditLogRepository extends BaseRepository<CreditLogType> implements ICreditLogRepository {
  constructor() {
    super(CreditLog)
  }
}
