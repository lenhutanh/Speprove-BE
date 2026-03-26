import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IAttemptRepository } from './attempt.repository.interface'

@singleton()
export class AttemptService {
  constructor(@inject(TOKENS.IAttemptRepository) private readonly attemptRepository: IAttemptRepository) {}
}
