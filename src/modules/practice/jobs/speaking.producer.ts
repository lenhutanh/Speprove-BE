import { singleton } from 'tsyringe'
import { BaseProducer } from '~/core/queue/base.producer'
import { JOB_NAME, QUEUE_NAME } from '~/core/queue/queue.constants'
import { QueueRegistry } from '~/core/queue/queue.registry'
import {
  AssessJobData,
  EvaluateJobData,
  ExtractVocabularyJobData,
  ScoreSessionJobData,
  TranscribeJobData
} from './speaking-job.type'
import { logger } from '~/core/logging/logger'

@singleton()
export class SpeakingProducer extends BaseProducer {
  constructor(queueRegistry: QueueRegistry) {
    super(queueRegistry, QUEUE_NAME.SPEAKING)
  }

  public async transcribe(data: TranscribeJobData) {
    logger.info('Start transcribing at: ', Date.now())
    return this.addJob(JOB_NAME.SPEAKING.TRANSCRIBE, data, {
      priority: 1,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }

  public async assess(data: AssessJobData) {
    logger.info('Start assessing at: ', Date.now())
    return this.addJob(JOB_NAME.SPEAKING.ASSESS, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }

  public async evaluate(data: EvaluateJobData) {
    logger.info('Start evaluating at: ', Date.now())
    return this.addJob(JOB_NAME.SPEAKING.EVALUATE, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }

  public async scoreSession(data: ScoreSessionJobData) {
    return this.addJob(JOB_NAME.SPEAKING.SCORE_SESSION, data, {
      attempts: 3
    })
  }

  public async extractVocabulary(data: ExtractVocabularyJobData) {
    return this.addJob(JOB_NAME.SPEAKING.EXTRACT_VOCABULARY, data, {
      attempts: 2
    })
  }
}
