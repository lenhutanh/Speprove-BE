import { Job } from 'bullmq'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { BaseConsumer } from '~/infrastructure/workers/consumers/base.consumer'
import { WorkerFactory } from '~/infrastructure/workers/worker.factory'
import { QUEUE_NAME, JOB_NAME } from '~/infrastructure/queues'
import { IMailService } from '~/modules/mail'

@singleton()
export class MailConsumer extends BaseConsumer {
  protected readonly queueName = QUEUE_NAME.MAIL

  constructor(
    workerFactory: WorkerFactory,
    @inject(TOKENS.IMailService) private readonly mailService: IMailService
  ) {
    super(workerFactory)
  }

  protected async process(job: Job): Promise<any> {
    switch (job.name) {
      case JOB_NAME.MAIL.SEND_OTP:
        return this.handleSendEmail(job.data)

      // Sau này có thêm loại mail khác, chỉ cần thêm case ở đây
      // case JOB_NAME.MAIL.SEND_WELCOME:
      //   return this.handleWelcomeEmail(job.data)

      default:
        throw new Error(`[MailConsumer] Unknown job name: ${job.name}`)
    }
  }

  private async handleSendEmail(data: any) {
    const { to, subject, htmlContent } = data

    // console.log(`[MailConsumer] ✉️ Sending email to: ${to} | Subject: ${subject}`)

    return await this.mailService.sendEmail(to, subject, htmlContent)
  }
}
