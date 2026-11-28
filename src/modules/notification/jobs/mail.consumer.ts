import { Job } from 'bullmq'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { BaseConsumer } from '~/core/queue/base.consumer'
import { WorkerRegistry } from '~/core/queue/worker.registry'
import { QUEUE_NAME, JOB_NAME } from '~/core/queue/queue.constants'
import { IMailService } from '~/modules/notification/mail.service.interface'

@singleton()
export class MailConsumer extends BaseConsumer {
  protected readonly queueName = QUEUE_NAME.MAIL

  constructor(
    workerRegistry: WorkerRegistry,
    @inject(TOKENS.IMailService) private readonly mailService: IMailService
  ) {
    super(workerRegistry)
  }

  protected async process(job: Job): Promise<any> {
    switch (job.name) {
      case JOB_NAME.MAIL.SEND_OTP:
        return this.handleSendEmail(job.data)

      default:
        throw new Error(`[MailConsumer] Unknown job name: ${job.name}`)
    }
  }

  private async handleSendEmail(data: any) {
    const { to, subject, htmlContent } = data

    return await this.mailService.sendEmail(to, subject, htmlContent)
  }
}
