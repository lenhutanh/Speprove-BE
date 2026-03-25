import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastTopicType } from './forecast-topic.model'
import { ForecastTopicResponseDto } from './forecast-topic.dto'
import { TopicType } from '../topic/topic.model'

@singleton()
export class ForecastTopicMapper extends BaseMapper<ForecastTopicType, ForecastTopicResponseDto> {
  toResponse(entity: ForecastTopicType): ForecastTopicResponseDto {
    const topic = entity.topicId as unknown as TopicType
    console.log('🚀 ~ ForecastTopicMapper ~ toResponse ~ topic:', topic)

    return {
      id: entity._id.toString(),
      forecastId: entity.forecastId.toString(),
      order: entity.order,
      topicId: topic._id.toString(),
      name: topic.name,
      slug: topic.slug,
      part: topic.part as 1 | 2 | 3
    }
  }
}
