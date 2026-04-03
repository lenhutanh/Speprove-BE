import { IBaseRepository } from '~/common/base'
import { AttemptType } from './attempt.model'

export interface IAttemptRepository extends IBaseRepository<AttemptType> {
  createOrUpdateAttempt(data: Partial<AttemptType>): Promise<AttemptType>
}
