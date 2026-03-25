import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastTopicRepository } from './repositories/forecast-topic.repository.interface'
import { toObjectId } from '~/common/utils'
import { GetForecastTopicType } from './forecast-topic.validation'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastTopicMapper } from './forecast-topic.mapper'

@singleton()
export class ForecastTopicService {
  constructor(
    @inject(TOKENS.IForecastTopicRepository)
    private readonly forecastTopicRepository: IForecastTopicRepository,
    private readonly forecastTopicMapper: ForecastTopicMapper
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

  public async getList(query: GetForecastTopicType) {
    const { data, pagination } = await this.forecastTopicRepository.getList(query)
    console.log('🚀 ~ ForecastTopicService ~ getList ~ data:', data)
    return {
      data: this.forecastTopicMapper.toResponseList(data),
      pagination
    }
  }

  public async getDetails(id: string) {
    const forecastTopic = await this.forecastTopicRepository.findById(id, {
      populate: 'topicId'
    })
    if (!forecastTopic) throw new AppError('Forecast topic not found', StatusCodes.NOT_FOUND)
    return this.forecastTopicMapper.toResponse(forecastTopic)
  }
}
