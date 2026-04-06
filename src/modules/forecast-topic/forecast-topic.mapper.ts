import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastTopicType } from './forecast-topic.model'
import { ForecastTopicResponseDto } from './forecast-topic.dto'
import { TopicType } from '../topic/topic.model'

@singleton()
export class ForecastTopicMapper extends BaseMapper<ForecastTopicType, ForecastTopicResponseDto> {
  toResponse(entity: ForecastTopicType): ForecastTopicResponseDto {
    const topic = entity.topicId as unknown as TopicType
    const isPopulated = topic && typeof topic === 'object' && '_id' in topic

    return {
      id: entity._id.toString(),
      forecastId: entity.forecastId.toString(),
      order: entity.order,
      topicId: isPopulated ? topic._id.toString() : entity.topicId.toString(),
      name: isPopulated ? topic.name : '',
      slug: isPopulated ? topic.slug : ''
    }
  }
}
