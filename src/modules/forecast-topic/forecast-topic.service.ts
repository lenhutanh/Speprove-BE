import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastTopicRepository } from './repositories/forecast-topic.repository.interface'
import { toObjectId } from '~/common/utils'

@singleton()
export class ForecastTopicService {
  constructor(
    @inject(TOKENS.IForecastTopicRepository)
    private readonly forecastTopicRepository: IForecastTopicRepository
  ) {}

  public async importTopics(forecastId: string, selectedTopics: { topicId: string; order: number }[]) {
    const topicIds = selectedTopics.map((t) => t.topicId)
    await this.forecastTopicRepository.withTransaction(async (session) => {
      await this.forecastTopicRepository.hardDeleteMany(
        {
          forecastId: toObjectId(forecastId),
          topicId: { $nin: topicIds.map((id) => toObjectId(id)) }
        },
        { session }
      )

      const ops = selectedTopics.map((item) => ({
        updateOne: {
          filter: {
            forecastId: toObjectId(forecastId),
            topicId: toObjectId(item.topicId)
          },
          update: {
            $set: { order: item.order }
          },
          upsert: true
        }
      }))

      if (ops.length > 0) {
        await this.forecastTopicRepository.bulkWrite(ops, { session })
      }
    })
  }
}
