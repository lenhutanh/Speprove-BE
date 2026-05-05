import { IBaseRepository } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionQueryType } from './forecast-question.type'

export interface IForecastQuestionRepository extends IBaseRepository<ForecastQuestionType> {
  getList(query: ForecastQuestionQueryType): Promise<any>
  getRandomPart1Questions(forecastTopicId: string, limit: number): Promise<any>
  getRandomPart2Question(forecastId: string, excludeIds: string[]): Promise<any>
  getRandomPart3Questions(forecastId: string, parentId: string, limit: number): Promise<any>
}
