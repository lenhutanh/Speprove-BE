import { singleton } from 'tsyringe'
import { BaseRepository } from '~/common/base'
import { Attempt, AttemptType } from './attempt.model'
import { IAttemptRepository } from './attempt.repository.interface'
import { ATTEMPT_STATUS, SPEAKING_SESSION_MODE } from '~/common/constants/constants'

@singleton()
export class AttemptRepository extends BaseRepository<AttemptType> implements IAttemptRepository {
  constructor() {
    super(Attempt)
  }

  public async createOrUpdateAttempt(data: Partial<AttemptType>): Promise<AttemptType> {
    const isProcessing = await this.exists({
      userId: data.userId,
      forecastQuestionId: data.forecastQuestionId,
      speakingSessionId: data.speakingSessionId || null,
      status: { $in: [ATTEMPT_STATUS.PENDING, ATTEMPT_STATUS.PROCESSING] }
    })

    if (isProcessing) {
      throw new Error('PROCESSING_CONFLICT')
    }

    if (data.mode === SPEAKING_SESSION_MODE.MOCK) {
      return (await this.model
        .findOneAndUpdate(
          {
            speakingSessionId: data.speakingSessionId,
            forecastQuestionId: data.forecastQuestionId
          },
          { $set: data },
          { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
        )
        .exec()) as AttemptType
    }

    const newAttempt = await this.model.create(data)
    return newAttempt.toObject() as AttemptType
  }
}
