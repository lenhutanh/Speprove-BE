import { IBaseRepository } from '~/common/base/base.repository.interface'
import { ForecastType } from '../forecast.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IForecastRepository extends IBaseRepository<ForecastType> {}
