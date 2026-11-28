export interface IMailService {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<any>
}
