import { IBaseRepository } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionQueryType } from './forecast-question.type'

export interface IForecastQuestionRepository extends IBaseRepository<ForecastQuestionType> {
  getList(query: ForecastQuestionQueryType): Promise<any>
}
