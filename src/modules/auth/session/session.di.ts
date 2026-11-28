import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { SessionRepository } from './session.repository'

export const registerSessionModule = () => {
  container.registerSingleton(TOKENS.ISessionRepository, SessionRepository)
}
