import { IBaseRepository } from '~/common/base'
import { ForecastTopicType } from '../forecast-topic.model'
import { GetForecastTopicType } from '../forecast-topic.validation'

export interface IForecastTopicRepository extends IBaseRepository<ForecastTopicType> {
  getList(query: GetForecastTopicType): Promise<any>
}
