import { StatusCodes } from 'http-status-codes'
import { CreateForecastBodyType, UpdateForecastBodyType } from '~/modules/forecast/types/forecast.type'
import { inject, singleton } from 'tsyringe'
import { QueryBuilder } from '~/common/base/query-builder'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastRepository } from './repositories/forecast.repository.interface'
import { ForecastType } from './forecast.model'
import { AppError } from '~/common/errors'

@singleton()
export class ForecastService {
  constructor(@inject(TOKENS.IForecastRepository) private readonly forecastRepository: IForecastRepository) {}
  public async createNew(data: CreateForecastBodyType) {
    const existed = await this.forecastRepository.findOne({ quarter: data.quarter, year: data.year })
    if (existed) throw new AppError(`Forecast for Q${data.quarter} ${data.year} already exists`, StatusCodes.CONFLICT)
    const slug = `ielts-speaking-forecast-q${data.quarter}-${data.year}`
    const name = data.name || `IELTS Speaking Forecast Q${data.quarter} ${data.year}`
    return await this.forecastRepository.create({ ...data, name, slug })
  }

  // async update(id: string, data: UpdateForecastBodyType) {
  //   const forecast = await this.forecastRepository.findById(id)
  //   if (!forecast) {
  //     throw new AppError('Forecast not found', StatusCodes.NOT_FOUND)
  //   }

  //   if (data.name && data.name !== forecast.name) {
  //     const nameExisted = await this.forecastRepository.findOne({
  //       name: data.name,
  //       _id: { $ne: id }
  //     })
  //     if (nameExisted) throw new AppError('Forecast name already exists', StatusCodes.CONFLICT)

  //     forecast.slug = await generateUniqueSlug(Forecast, data.name)
  //   }

  //   Object.assign(forecast, data)
  //   return await this.forecastRepository.updateById(id, forecast)
  // }

  public async getList(query?: any) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = query
    const qb = new QueryBuilder<ForecastType>()

    const { filter, options } = qb
      .applyFilters(filters, ['quarter', 'year', 'status', 'createdAt'])
      .search(['name'], search)
      .sort(sortBy, sortOrder)
      .build()

    return await this.forecastRepository.paginate(filter, page, limit, options)
  }

  public async getDetails(id: string) {
    const forecast = await this.forecastRepository.findById(id)
    if (!forecast) throw new AppError('Forecast not found', StatusCodes.NOT_FOUND)
    return forecast
  }
}
