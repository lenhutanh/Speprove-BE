import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ForecastTopicRepository } from './forecast-topic.repository'

export const registerForecastTopicModule = () => {
  container.registerSingleton(TOKENS.IForecastTopicRepository, ForecastTopicRepository)
}
