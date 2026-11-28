import { BaseRepository } from '~/core/persistence/base.repository'
import { Topic, TopicType } from './topic.model'
import { ITopicRepository } from './topic.repository.interface'

export class TopicRepository extends BaseRepository<TopicType> implements ITopicRepository {
  constructor() {
    super(Topic)
  }
}
