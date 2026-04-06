import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { TopicType } from './topic.model'
import { TopicResponseDto } from './topic.dto'

@singleton()
export class TopicMapper extends BaseMapper<TopicType, TopicResponseDto> {
  toResponse(entity: TopicType): TopicResponseDto {
    return {
      id: entity._id.toString(),
      name: entity.name,
      slug: entity.slug,
      status: entity.status
    }
  }
}
