import { container } from 'tsyringe'
import { WorkerFactory } from './worker.factory'
import { MailConsumer } from './consumers/mail.consumer'
import { FileConsumer } from './consumers/file.consumer'

export function startWorkers(): void {
  console.log('🔧 Starting workers...')

  container.resolve(FileConsumer).start()
  container.resolve(MailConsumer).start()

  console.log('✅ Workers ready\n')
}

export async function shutdownWorkers(): Promise<void> {
  const workerFactory = container.resolve(WorkerFactory)
  await workerFactory.shutdown()
}
