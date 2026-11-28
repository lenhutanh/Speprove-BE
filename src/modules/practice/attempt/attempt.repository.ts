import { singleton } from 'tsyringe'
import { BaseRepository } from '~/core/persistence/base.repository'
import { Attempt, AttemptType } from './attempt.model'
import { IAttemptRepository } from './attempt.repository.interface'

@singleton()
export class AttemptRepository extends BaseRepository<AttemptType> implements IAttemptRepository {
  constructor() {
    super(Attempt)
  }
}
