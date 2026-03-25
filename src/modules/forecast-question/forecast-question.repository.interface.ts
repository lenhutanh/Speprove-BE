import { IBaseRepository } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { GetForecastQuestionType } from './forecast-question.validation'

export interface IForecastQuestionRepository extends IBaseRepository<ForecastQuestionType> {
  getList(query: GetForecastQuestionType): Promise<any>
}
