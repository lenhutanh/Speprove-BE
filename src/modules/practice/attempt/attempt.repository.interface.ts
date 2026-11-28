import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { AttemptType } from './attempt.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAttemptRepository extends IBaseRepository<AttemptType> {}
