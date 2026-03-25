import { BaseRepository } from '~/common/base'
import { ForecastTopic, ForecastTopicType } from '../forecast-topic.model'
import { IForecastTopicRepository } from './forecast-topic.repository.interface'
import { singleton } from 'tsyringe'
import { PipelineStage, Types } from 'mongoose'
import { GetForecastTopicType } from '../forecast-topic.validation'

@singleton()
export class ForecastTopicRepository extends BaseRepository<ForecastTopicType> implements IForecastTopicRepository {
  constructor() {
    super(ForecastTopic)
  }

  public async getList(query: GetForecastTopicType): Promise<any> {
    const { page, limit, search, forecastId, topicId, part } = query ?? {}

    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastId: new Types.ObjectId(forecastId)
        }
      }
    ]

    if (topicId) {
      pipeline.push({ $match: { topicId: new Types.ObjectId(topicId) } })
    }

    pipeline.push(
      {
        $lookup: {
          from: 'topics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topicId'
        }
      },
      { $unwind: '$topicId' }
    )

    if (part) {
      pipeline.push({
        $match: { 'topicId.part': Number(part) }
      })
    }

    if (search) {
      pipeline.push({
        $match: {
          'topicId.name': { $regex: search, $options: 'i' }
        }
      })
    }

    pipeline.push({ $sort: { order: 1 } })

    return this.aggregatePaginate(pipeline, page, limit)
  }
}
