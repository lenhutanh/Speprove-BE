import { IBaseRepository } from '~/common/base'
import { ForecastTopicType } from '../forecast-topic.model'
import { ForecastTopicQueryType } from '../forecast-topic.type'

export interface IForecastTopicRepository extends IBaseRepository<ForecastTopicType> {
  getList(query: ForecastTopicQueryType): Promise<any>
}
