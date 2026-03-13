import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { toObjectId } from '~/common/utils'

@singleton()
export class ForecastQuestionService {
  constructor(
    @inject(TOKENS.IForecastQuestionRepository)
    private readonly forecastQuestionRepository: IForecastQuestionRepository
  ) {}

  public async importQuestions(
    forecastId: string,
    topicId: string,
    questions: { questionId: string; order: number }[]
  ) {
    const questionIds = questions.map((q) => toObjectId(q.questionId))

    await this.forecastQuestionRepository.withTransaction(async (session) => {
      await this.forecastQuestionRepository.hardDeleteMany(
        {
          forecastId: toObjectId(forecastId),
          questionId: { $nin: questionIds }
        },
        { session }
      )

      const ops = questions.map((item) => ({
        updateOne: {
          filter: {
            forecastId: toObjectId(forecastId),
            questionId: toObjectId(item.questionId)
          },
          update: {
            $set: { order: item.order }
          },
          upsert: true
        }
      }))

      if (ops.length > 0) {
        await this.forecastQuestionRepository.bulkWrite(ops, { session })
      }
    })
  }
}
