import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo'
import { singleton } from 'tsyringe'
import { env } from '~/common/config/env.config'

@singleton()
export class BrevoMailProvider {
  private emailAPI: TransactionalEmailsApi

  constructor() {
    this.emailAPI = new TransactionalEmailsApi()
    this.emailAPI.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.MAIL.BREVO_API_KEY)
  }

  async send(to: string, subject: string, htmlContent: string) {
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = {
      name: env.MAIL.SENDER_NAME,
      email: env.MAIL.SENDER_EMAIL
    }
    sendSmtpEmail.to = [{ email: to }]

    const { body } = await this.emailAPI.sendTransacEmail(sendSmtpEmail)

    return body
  }
}
