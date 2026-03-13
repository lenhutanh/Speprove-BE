import { BaseRepository } from '~/common/base/base.repository'
import { IForecastRepository } from './forecast.repository.interface'
import { Forecast, ForecastType } from '../forecast.model'

export class ForecastRepository extends BaseRepository<ForecastType> implements IForecastRepository {
  constructor() {
    super(Forecast)
  }
}
