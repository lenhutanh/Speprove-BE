import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { TopicType } from './topic.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ITopicRepository extends IBaseRepository<TopicType> {}
