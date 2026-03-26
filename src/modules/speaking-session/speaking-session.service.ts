import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ISpeakingSessionRepository } from './speaking-session.repository.interface'

@singleton()
export class SpeakingSessionService {
  constructor(
    @inject(TOKENS.ISpeakingSessionRepository) private readonly speakingSessionRepository: ISpeakingSessionRepository
  ) {}
}
