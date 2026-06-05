import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IForecastTopicRepository } from './repositories/forecast-topic.repository.interface'
import { toObjectId } from '~/common/utils'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastTopicMapper } from './forecast-topic.mapper'
import { ForecastTopicQueryType } from './forecast-topic.type'

@singleton()
export class ForecastTopicService {
  constructor(
    @inject(TOKENS.IForecastTopicRepository)
    private readonly forecastTopicRepository: IForecastTopicRepository,
    private readonly forecastTopicMapper: ForecastTopicMapper
  ) {}

  public async importTopics(forecastId: string, topicIds: string[]) {
    const forecastIdObj = toObjectId(forecastId)
    const targetTopicIds = topicIds.map((id) => toObjectId(id))

    await this.forecastTopicRepository.withTransaction(async (session) => {
      await this.forecastTopicRepository.hardDeleteMany(
        {
          forecastId: forecastIdObj,
          topicId: { $nin: targetTopicIds }
        },
        { session }
      )

      const ops = topicIds.map((id, index) => ({
        updateOne: {
          filter: {
            forecastId: forecastIdObj,
            topicId: toObjectId(id)
          },
          update: {
            $set: { order: index }
          },
          upsert: true
        }
      }))

      if (ops.length > 0) {
        await this.forecastTopicRepository.bulkWrite(ops, { session })
      }
    })
  }

  public async getList(query: ForecastTopicQueryType) {
    const result = await this.forecastTopicRepository.getList(query)
    return {
      data: this.forecastTopicMapper.toResponseList(result.data),
      pagination: result.pagination
    }
  }

  public async getDetails(id: string) {
    const forecastTopic = await this.forecastTopicRepository.findById(id, {
      populate: 'topicId'
    })
    if (!forecastTopic) throw new AppError('Forecast topic not found', StatusCodes.NOT_FOUND)
    return this.forecastTopicMapper.toResponse(forecastTopic)
  }

  public async getRandomTopics(forecastId: string, excludeIds: string[], limit: number) {
    return await this.forecastTopicRepository.getRandom(forecastId, excludeIds, limit)
  }
}
