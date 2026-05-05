import { Job } from 'bullmq'
import { singleton } from 'tsyringe'
import { JOB_NAME, QUEUE_NAME } from '~/infrastructure/queues'
import { BaseConsumer } from './base.consumer'
import { WorkerFactory } from '../worker.factory'
import { QuestionAudioService } from '~/modules/question-audio/question-audio.service'
import { InstructionAudioService } from '~/modules/instruction-audio/instruction-audio.service'

@singleton()
export class FileConsumer extends BaseConsumer {
  protected readonly queueName = QUEUE_NAME.FILE

  constructor(
    workerFactory: WorkerFactory,
    private readonly questionAudioService: QuestionAudioService,
    private readonly instructionAudioService: InstructionAudioService
  ) {
    super(workerFactory)
  }

  protected async process(job: Job): Promise<any> {
    switch (job.name) {
      case JOB_NAME.QUESTION_AUDIO.GENERATE:
        await this.questionAudioService.generate(job.data)
        break
      case JOB_NAME.INSTRUCTION_AUDIO.GENERATE:
        await this.instructionAudioService.generate(job.data)
        break
      default:
        throw new Error(`[FileConsumer] Unknown job name: ${job.name}`)
    }
  }
}
