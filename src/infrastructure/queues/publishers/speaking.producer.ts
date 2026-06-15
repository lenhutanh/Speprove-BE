import { singleton } from 'tsyringe'
import { BaseProducer } from '~/infrastructure/queues/publishers/base.producer'
import { JOB_NAME, QUEUE_NAME, QueueFactory } from '~/infrastructure/queues'
import {
  AssessJobData,
  EvaluateJobData,
  ExtractVocabularyJobData,
  ScoreSessionJobData,
  TranscribeJobData
} from '../types/speaking.job.types'

@singleton()
export class SpeakingProducer extends BaseProducer {
  constructor(queueFactory: QueueFactory) {
    super(queueFactory, QUEUE_NAME.SPEAKING)
  }

  public async transcribe(data: TranscribeJobData) {
    console.log('Start transcribing at: ', Date.now())
    return this.addJob(JOB_NAME.SPEAKING.TRANSCRIBE, data, {
      priority: 1,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }

  public async assess(data: AssessJobData) {
    console.log('Start assessing at: ', Date.now())
    return this.addJob(JOB_NAME.SPEAKING.ASSESS, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }

  public async evaluate(data: EvaluateJobData) {
    console.log('Start evaluating at: ', Date.now())
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
