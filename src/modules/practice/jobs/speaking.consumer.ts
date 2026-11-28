import { Job } from 'bullmq'
import { singleton } from 'tsyringe'
import { BaseConsumer } from '../../../core/queue/base.consumer'
import { WorkerRegistry } from '../../../core/queue/worker.registry'
import { QUEUE_NAME, JOB_NAME } from '~/core/queue/queue.constants'
import {
  AssessJobData,
  EvaluateJobData,
  ExtractVocabularyJobData,
  ScoreSessionJobData,
  TranscribeJobData
} from '~/modules/practice/jobs/speaking-job.type'
import { SpeakingAnalysisService } from '~/modules/assessment/speaking-analysis.service'
import { VocabularyExtractionService } from '~/modules/practice/jobs/vocabulary-extraction.service'

type SpeakingJobData =
  TranscribeJobData | AssessJobData | EvaluateJobData | ScoreSessionJobData | ExtractVocabularyJobData

@singleton()
export class SpeakingConsumer extends BaseConsumer<SpeakingJobData> {
  protected readonly queueName = QUEUE_NAME.SPEAKING

  constructor(
    workerRegistry: WorkerRegistry,
    private readonly speakingAnalysisService: SpeakingAnalysisService,
    private readonly vocabularyExtractionService: VocabularyExtractionService
  ) {
    super(workerRegistry)
  }

  protected async process(job: Job<SpeakingJobData>): Promise<void> {
    switch (job.name) {
      case JOB_NAME.SPEAKING.TRANSCRIBE:
        await this.speakingAnalysisService.transcribe(
          job.data as TranscribeJobData,
          job.attemptsMade,
          job.opts.attempts || 1
        )
        break
      case JOB_NAME.SPEAKING.ASSESS:
        await this.speakingAnalysisService.assess(job.data as AssessJobData, job.attemptsMade, job.opts.attempts || 1)
        break
      case JOB_NAME.SPEAKING.EVALUATE:
        await this.speakingAnalysisService.evaluate(
          job.data as EvaluateJobData,
          job.attemptsMade,
          job.opts.attempts || 1
        )
        break
      case JOB_NAME.SPEAKING.SCORE_SESSION:
        await this.speakingAnalysisService.scoreSession(job.data as ScoreSessionJobData)
        break
      case JOB_NAME.SPEAKING.EXTRACT_VOCABULARY:
        await this.vocabularyExtractionService.extractFromAttempt(job.data as ExtractVocabularyJobData)
        break
      default:
        throw new Error(`[Speaking Consumer] Unknown job: ${job.name}`)
    }
  }
}
