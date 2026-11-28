import { Worker } from 'bullmq'
import { singleton } from 'tsyringe'
import { logger } from '~/core/logging/logger'

@singleton()
export class WorkerRegistry {
  private workers = new Map<string, Worker>()

  register(name: string, worker: Worker): void {
    if (this.workers.has(name)) {
      logger.warn(`[WorkerRegistry] Worker "${name}" already registered, skipping`)
      return
    }
    this.workers.set(name, worker)
    logger.info(`[WorkerRegistry] Registered worker: ${name}`)
  }

  getAllWorkers(): Worker[] {
    return [...this.workers.values()]
  }

  async shutdown(): Promise<void> {
    await Promise.all([...this.workers.values()].map((w) => w.close()))
    logger.info('[WorkerRegistry] All workers closed')
  }
}
