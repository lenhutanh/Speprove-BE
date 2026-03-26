import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { SpeakingSessionRepository } from './speaking-session.repository'

export const registerSpeakingSessionModule = () => {
  container.registerSingleton(TOKENS.ISpeakingSessionRepository, SpeakingSessionRepository)
}
