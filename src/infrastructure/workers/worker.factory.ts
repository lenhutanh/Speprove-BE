import { Worker } from 'bullmq'
import { singleton } from 'tsyringe'
import { logger } from '~/infrastructure/logging/logger'

@singleton()
export class WorkerFactory {
  private workers = new Map<string, Worker>()

  register(name: string, worker: Worker): void {
    if (this.workers.has(name)) {
      logger.warn(`[WorkerFactory] Worker "${name}" already registered, skipping`)
      return
    }
    this.workers.set(name, worker)
    logger.info(`[WorkerFactory] Registered worker: ${name}`)
  }

  getAllWorkers(): Worker[] {
    return [...this.workers.values()]
  }

  async shutdown(): Promise<void> {
    await Promise.all([...this.workers.values()].map((w) => w.close()))
    logger.info('[WorkerFactory] All workers closed')
  }
}
