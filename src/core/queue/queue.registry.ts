import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { singleton } from 'tsyringe'
import { createRedisClient } from '../redis/redis-client.util'
import { QUEUE_NAME, QueueName } from './queue.constants'
import { logger } from '~/core/logging/logger'

@singleton()
export class QueueRegistry {
  private queues = new Map<QueueName, Queue>()
  private readonly sharedConnection: Redis

  constructor() {
    this.sharedConnection = createRedisClient('queue')
  }
  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.sharedConnection as any,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 }
        }
      })

      this.queues.set(name, queue)
      logger.info(`[QueueRegistry] Created queue: ${name}`)
    }

    return this.queues.get(name)!
  }

  initQueues(): void {
    Object.values(QUEUE_NAME).forEach((name) => this.getQueue(name as QueueName))
    logger.info('[QueueRegistry] All queues initialized')
  }

  getAllQueues(): Queue[] {
    return [...this.queues.values()]
  }

  async shutdown(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()))
    logger.info('[QueueRegistry] All queues closed')
  }
}
