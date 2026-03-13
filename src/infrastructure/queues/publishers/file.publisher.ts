import { singleton } from 'tsyringe'
import { QUEUE_NAME, QueueFactory } from '~/infrastructure/queues'

@singleton()
export class FilePublisher {
  constructor(private readonly queueFactory: QueueFactory) {}

  private get queue() {
    return this.queueFactory.getQueue(QUEUE_NAME.FILE)
  }

  async add(name: string, data: unknown) {
    return this.queue.add(name, data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    })
  }

  async addBulk(jobs: { name: string; data: unknown }[]) {
    return this.queue.addBulk(
      jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: {
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: true
        }
      }))
    )
  }
}
