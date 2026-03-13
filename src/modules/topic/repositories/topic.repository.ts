import { BaseRepository } from '~/common/base/base.repository'
import { Topic, TopicType } from '../topic.model'
import { ITopicRepository } from './topic.repository.interface'

export class TopicRepository extends BaseRepository<TopicType> implements ITopicRepository {
  constructor() {
    super(Topic)
  }
}
