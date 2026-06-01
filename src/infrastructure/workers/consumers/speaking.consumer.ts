import { Job } from 'bullmq'
import { singleton } from 'tsyringe'
import { BaseConsumer } from './base.consumer'
import { WorkerFactory } from '../worker.factory'
import { QUEUE_NAME, JOB_NAME } from '~/infrastructure/queues'
import {
  AssessJobData,
  EvaluateJobData,
  ScoreSessionJobData,
  TranscribeJobData
} from '~/infrastructure/queues/types/speaking.job.types'
import { SpeakingAnalysisService } from '~/modules/attempt/speaking-analysis.service'

type SpeakingJobData = TranscribeJobData | AssessJobData | EvaluateJobData | ScoreSessionJobData

@singleton()
export class SpeakingConsumer extends BaseConsumer<SpeakingJobData> {
  protected readonly queueName = QUEUE_NAME.SPEAKING

  constructor(
    workerFactory: WorkerFactory,
    private readonly speakingAnalysisService: SpeakingAnalysisService
  ) {
    super(workerFactory)
  }

  protected async process(job: Job<SpeakingJobData>): Promise<void> {
    switch (job.name) {
      case JOB_NAME.SPEAKING.TRANSCRIBE:
        await this.speakingAnalysisService.transcribe(job.data as TranscribeJobData)
        break
      case JOB_NAME.SPEAKING.ASSESS:
        await this.speakingAnalysisService.assess(job.data as AssessJobData)
        break
      case JOB_NAME.SPEAKING.EVALUATE:
        await this.speakingAnalysisService.evaluate(job.data as EvaluateJobData)
        break
      case JOB_NAME.SPEAKING.SCORE_SESSION:
        await this.speakingAnalysisService.scoreSession(job.data as ScoreSessionJobData)
        break
      default:
        throw new Error(`[Speaking Consumer] Unknown job: ${job.name}`)
    }
  }
}
