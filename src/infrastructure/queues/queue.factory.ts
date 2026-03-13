import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { singleton } from 'tsyringe'
import { createRedisClient } from '../redis/redis.factory'
import { QUEUE_NAME, QueueName } from './queue.constant'

@singleton()
export class QueueFactory {
  private queues = new Map<QueueName, Queue>()
  private readonly sharedConnection: Redis

  constructor() {
    this.sharedConnection = createRedisClient('queue-factory')
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
      console.log(`[QueueFactory] Created queue: ${name}`)
    }

    return this.queues.get(name)!
  }

  initQueues(): void {
    Object.values(QUEUE_NAME).forEach((name) => this.getQueue(name as QueueName))
    console.log('[QueueFactory] All queues initialized')
  }

  getAllQueues(): Queue[] {
    return [...this.queues.values()]
  }

  async shutdown(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()))
    console.log('[QueueFactory] All queues closed')
  }
}
