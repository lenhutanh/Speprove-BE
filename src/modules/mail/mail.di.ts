import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { MailService } from './mail.service'

export const registerMailModule = () => {
  container.registerSingleton(TOKENS.IMailService, MailService)
}
