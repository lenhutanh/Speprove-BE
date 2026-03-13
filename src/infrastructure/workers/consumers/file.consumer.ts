import { Job } from 'bullmq'
import { container, singleton } from 'tsyringe'
import { JOB_NAME, QUEUE_NAME } from '~/infrastructure/queues'
import { BaseConsumer } from './base.consumer'
import { WorkerFactory } from '../worker.factory'
import { QuestionAudioService } from '~/modules/question-audio/question-audio.service'

@singleton()
export class FileConsumer extends BaseConsumer {
  protected readonly queueName = QUEUE_NAME.FILE

  constructor(workerFactory: WorkerFactory) {
    super(workerFactory)
  }

  protected async process(job: Job): Promise<any> {
    switch (job.name) {
      case JOB_NAME.QUESTION_AUDIO.GENERATE:
        await container.resolve(QuestionAudioService).generate(job.data)
        break
      default:
        throw new Error(`[FileConsumer] Unknown job name: ${job.name}`)
    }
  }
}
