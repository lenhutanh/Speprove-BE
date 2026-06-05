import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ForecastRepository } from './repositories/forecast.repository'

export const registerForecastModule = () => {
  container.registerSingleton(TOKENS.IForecastRepository, ForecastRepository)
}
