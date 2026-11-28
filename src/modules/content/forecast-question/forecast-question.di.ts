import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ForecastQuestionRepository } from './forecast-question.repository'

export const registerForecastQuestionModule = () => {
  container.registerSingleton(TOKENS.IForecastQuestionRepository, ForecastQuestionRepository)
}
