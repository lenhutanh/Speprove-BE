import { Job, Worker, WorkerOptions } from 'bullmq'
import { WorkerFactory } from '../worker.factory'
import { getRedisOptions } from '~/common/config'

export abstract class BaseConsumer<T = any> {
  protected abstract readonly queueName: string
  protected worker: Worker | undefined

  constructor(protected readonly workerFactory: WorkerFactory) {}

  public start(options: Partial<WorkerOptions> = {}): void {
    this.worker = new Worker(
      this.queueName,
      async (job: Job<T>) => {
        console.log(`[${this.queueName}] Processing job: ${job.name} (ID: ${job.id})`)
        return this.process(job)
      },
      {
        connection: getRedisOptions(),
        concurrency: 1,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
        ...options
      }
    )

    this.worker.on('completed', (job) => {
      console.log(`[${this.queueName}] Job ${job.id} [${job.name}] completed`)
    })

    this.worker.on('failed', (job, err) => {
      console.error(`[${this.queueName}] Job ${job?.id} [${job?.name}] failed:`, err.message)
    })

    this.workerFactory.register(this.queueName, this.worker)
  }

  public async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close()
    }
  }

  protected abstract process(job: Job<T>): Promise<any>
}
