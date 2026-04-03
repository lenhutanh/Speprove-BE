import { container } from 'tsyringe'
import { WorkerFactory } from './worker.factory'
import { MailConsumer } from './consumers/mail.consumer'
import { FileConsumer } from './consumers/file.consumer'
import { SpeakingConsumer } from './consumers/speaking.consumer'

export function startWorkers(): void {
  console.log('🔧 Starting workers...')

  container.resolve(FileConsumer).start()
  container.resolve(MailConsumer).start()
  container.resolve(SpeakingConsumer).start()

  console.log('✅ Workers ready\n')
}

export async function shutdownWorkers(): Promise<void> {
  const workerFactory = container.resolve(WorkerFactory)
  await workerFactory.shutdown()
}
