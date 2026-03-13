import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ForecastTopicRepository } from './repositories/forecast-topic.repository'

export const registerForecastTopicModule = () => {
  container.registerSingleton(TOKENS.IForecastTopicRepository, ForecastTopicRepository)
}
