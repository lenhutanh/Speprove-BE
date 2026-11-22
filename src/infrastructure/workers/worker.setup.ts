import { container } from 'tsyringe'
import { WorkerFactory } from './worker.factory'
import { MailConsumer } from './consumers/mail.consumer'
import { SpeakingConsumer } from './consumers/speaking.consumer'
import { logger } from '~/infrastructure/logging/logger'

export function startWorkers(): void {
  logger.info('🔧 Starting workers...')

  container.resolve(MailConsumer).start()
  container.resolve(SpeakingConsumer).start()

  logger.info('✅ Workers ready\n')
}

export async function shutdownWorkers(): Promise<void> {
  const workerFactory = container.resolve(WorkerFactory)
  await workerFactory.shutdown()
}
