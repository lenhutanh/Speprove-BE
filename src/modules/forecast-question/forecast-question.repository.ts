import { BaseRepository } from '~/common/base'
import { ForecastQuestion, ForecastQuestionType } from './forecast-question.model'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { singleton } from 'tsyringe'

@singleton()
export class ForecastQuestionRepository
  extends BaseRepository<ForecastQuestionType>
  implements IForecastQuestionRepository
{
  constructor() {
    super(ForecastQuestion)
  }
}
