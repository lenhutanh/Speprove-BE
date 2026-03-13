import { singleton } from 'tsyringe'
import { BrevoMailProvider } from '~/infrastructure/providers/mail/brevo-mail.provider'
import { IMailService } from './mail.service.interface'

@singleton()
export class MailService implements IMailService {
  constructor(private readonly mailProvider: BrevoMailProvider) {}

  public async sendEmail(to: string, subject: string, htmlContent: string) {
    return this.mailProvider.send(to, subject, htmlContent)
  }
}
