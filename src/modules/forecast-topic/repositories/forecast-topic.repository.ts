import { BaseRepository } from '~/common/base'
import { ForecastTopic, ForecastTopicType } from '../forecast-topic.model'
import { IForecastTopicRepository } from './forecast-topic.repository.interface'
import { singleton } from 'tsyringe'
import { PipelineStage, Types } from 'mongoose'
import { ForecastTopicQueryType } from '../forecast-topic.type'

@singleton()
export class ForecastTopicRepository extends BaseRepository<ForecastTopicType> implements IForecastTopicRepository {
  constructor() {
    super(ForecastTopic)
  }

  public async getRandom(forecastId: string, excludeIds: string[], limit: number): Promise<any> {
    const excludeObjectIds = excludeIds.map((id) => new Types.ObjectId(id))

    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastId: new Types.ObjectId(forecastId),
          _id: { $nin: excludeObjectIds }
        }
      },
      {
        $sample: { size: limit }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topicId'
        }
      },
      {
        $unwind: '$topicId'
      }
    ]

    return this.aggregate(pipeline)
  }

  public async getList(query: ForecastTopicQueryType): Promise<any> {
    const { page, limit, search, forecastId, topicId, sortBy, sortOrder } = query ?? {}
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

    if (search) {
      pipeline.push({
        $match: {
          'topicId.name': { $regex: search, $options: 'i' }
        }
      })
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1
    pipeline.push({ $sort: { ['order']: sortDirection } })

    return this.aggregatePaginate(pipeline, page, limit)
  }
}
