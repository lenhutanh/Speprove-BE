import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { MailService } from './mail.service'

export const registerMailModule = () => {
  container.registerSingleton(TOKENS.IMailService, MailService)
}
