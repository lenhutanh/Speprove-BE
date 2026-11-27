import { JobsOptions } from 'bullmq'
import { QueueFactory, QueueName } from '~/infrastructure/queues'
import { getRequestId } from '~/infrastructure/logging/request-context'

const withRequestId = (data: any) => {
  const requestId = getRequestId()
  return requestId && data && typeof data === 'object' ? { requestId, ...data } : data
}

export abstract class BaseProducer {
  constructor(
    protected readonly queueFactory: QueueFactory,
    private readonly queueName: QueueName
  ) {}

  protected get queue() {
    return this.queueFactory.getQueue(this.queueName)
  }

  protected get defaultOptions(): JobsOptions {
    return {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  }

  protected async addJob(name: string, data: any, opts?: JobsOptions) {
    return this.queue.add(name, withRequestId(data), { ...this.defaultOptions, ...opts })
  }

  protected async addBulk(jobs: { name: string; data: any; opts?: JobsOptions }[]) {
    const formattedJobs = jobs.map((job) => ({
      name: job.name,
      data: withRequestId(job.data),
      opts: { ...this.defaultOptions, ...job.opts }
    }))
    return this.queue.addBulk(formattedJobs)
  }
}
