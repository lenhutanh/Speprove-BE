import { container } from 'tsyringe'
import { WorkerRegistry } from '../core/queue/worker.registry'
import { MailConsumer } from '../modules/notification/jobs/mail.consumer'
import { SpeakingConsumer } from '../modules/practice/jobs/speaking.consumer'
import { logger } from '~/core/logging/logger'

export function startWorkers(): void {
  logger.info('🔧 Starting workers...')

  container.resolve(MailConsumer).start()
  container.resolve(SpeakingConsumer).start()

  logger.info('✅ Workers ready\n')
}

export async function shutdownWorkers(): Promise<void> {
  const workerRegistry = container.resolve(WorkerRegistry)
  await workerRegistry.shutdown()
}
