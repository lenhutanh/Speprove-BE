import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { SpeakingSessionRepository } from './speaking-session.repository'

export const registerSpeakingSessionModule = () => {
  container.registerSingleton(TOKENS.ISpeakingSessionRepository, SpeakingSessionRepository)
}
