import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo'
import { env } from '~/config/env.config'

let emailAPI = new TransactionalEmailsApi()
emailAPI.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.MAIL.BREVO_API_KEY)

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const sendSmtpEmail = new SendSmtpEmail()

  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = htmlContent
  sendSmtpEmail.sender = {
    name: env.MAIL.SENDER_NAME,
    email: env.MAIL.SENDER_EMAIL
  }
  sendSmtpEmail.to = [{ email: to }]

  try {
    const data = await emailAPI.sendTransacEmail(sendSmtpEmail)
    return data
  } catch (error) {
    console.error('Brevo Mail Error:', error)
    throw error
  }
}
export const MailProvider = {
  sendEmail
}
