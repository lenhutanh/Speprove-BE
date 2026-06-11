import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastTopicType } from './forecast-topic.model'
import { ForecastTopicResponseDto } from './forecast-topic.dto'

@singleton()
export class ForecastTopicMapper extends BaseMapper<ForecastTopicType, ForecastTopicResponseDto> {
  toResponse(entity: ForecastTopicType): ForecastTopicResponseDto {
    const topic = entity.topicId as any
    const forecast = entity.forecastId as any
    const isTopicPopulated = topic && typeof topic === 'object' && '_id' in topic
    const isForecastPopulated =
      forecast && typeof forecast === 'object' && '_id' in forecast && 'name' in forecast && 'slug' in forecast

    const response: ForecastTopicResponseDto = {
      id: entity._id.toString(),
      order: entity.order,
      topic: {
        id: isTopicPopulated ? topic._id.toString() : entity.topicId.toString(),
        name: isTopicPopulated ? topic.name : '',
        slug: isTopicPopulated ? topic.slug : ''
      },
      name: isTopicPopulated ? topic.name : '',
      slug: isTopicPopulated ? topic.slug : ''
    }

    if (isForecastPopulated) {
      response.forecast = {
        id: forecast._id.toString(),
        name: forecast.name,
        slug: forecast.slug
      }
    }

    return response
  }
}
