import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ForecastRepository } from './forecast.repository'

export const registerForecastModule = () => {
  container.registerSingleton(TOKENS.IForecastRepository, ForecastRepository)
}
