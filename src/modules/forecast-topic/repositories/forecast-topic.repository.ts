import { BaseRepository } from '~/common/base'
import { ForecastTopic, ForecastTopicType } from '../forecast-topic.model'
import { IForecastTopicRepository } from './forecast-topic.repository.interface'
import { singleton } from 'tsyringe'

@singleton()
export class ForecastTopicRepository extends BaseRepository<ForecastTopicType> implements IForecastTopicRepository {
  constructor() {
    super(ForecastTopic)
  }
}
