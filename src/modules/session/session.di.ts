import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { SessionRepository } from './repositories/session.repository'

export const registerSessionModule = () => {
  container.registerSingleton(TOKENS.ISessionRepository, SessionRepository)
}
