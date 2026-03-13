import { singleton } from 'tsyringe'
import { BasePublisher } from '~/infrastructure/queues/publishers/base.publisher'
import { JOB_NAME, QUEUE_NAME, QueueFactory } from '~/infrastructure/queues'

@singleton()
export class MailPublisher extends BasePublisher {
  constructor(queueFactory: QueueFactory) {
    super(queueFactory, QUEUE_NAME.MAIL)
  }

  public async publishSendOtp(data: any): Promise<void> {
    await this.addJob(JOB_NAME.MAIL.SEND_OTP, data, {
      priority: 1,
      attempts: 5
    })
  }
}
