import { singleton } from 'tsyringe'
import { BaseProducer } from '~/core/queue/base.producer'
import { JOB_NAME, QUEUE_NAME } from '~/core/queue/queue.constants'
import { QueueRegistry } from '~/core/queue/queue.registry'

@singleton()
export class MailProducer extends BaseProducer {
  constructor(queueRegistry: QueueRegistry) {
    super(queueRegistry, QUEUE_NAME.MAIL)
  }

  public async publishSendOtp(data: any): Promise<void> {
    await this.addJob(JOB_NAME.MAIL.SEND_OTP, data, {
      priority: 1,
      attempts: 5
    })
  }
}
