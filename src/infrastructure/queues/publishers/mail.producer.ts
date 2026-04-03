import { singleton } from 'tsyringe'
import { BaseProducer } from '~/infrastructure/queues/publishers/base.producer'
import { JOB_NAME, QUEUE_NAME, QueueFactory } from '~/infrastructure/queues'

@singleton()
export class MailProducer extends BaseProducer {
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
