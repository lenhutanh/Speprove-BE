import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ForecastQuestionRepository } from './forecast-question.repository'

export const registerForecastQuestionModule = () => {
  container.registerSingleton(TOKENS.IForecastQuestionRepository, ForecastQuestionRepository)
}
