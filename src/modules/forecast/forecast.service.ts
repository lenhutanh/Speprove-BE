import { StatusCodes } from 'http-status-codes'
import { CreateForecastBodyType, UpdateForecastBodyType } from '~/modules/forecast/types/forecast.type'
import { inject, singleton } from 'tsyringe'
import { QueryBuilder } from '~/common/base/query-builder'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastRepository } from './repositories/forecast.repository.interface'
import { ForecastType } from './forecast.model'
import { AppError } from '~/common/errors'
import { ForecastMapper } from './forecast.mapper'
import { generateSlug, toObjectId } from '~/common/utils'
import { FORECAST_STATUS } from '~/common/constants/constants'
import { ErrorCodes } from '~/common/constants/error-codes'

@singleton()
export class ForecastService {
  constructor(
    @inject(TOKENS.IForecastRepository) private readonly forecastRepository: IForecastRepository,
    private readonly forecastMapper: ForecastMapper
  ) {}
  public async createNew(data: CreateForecastBodyType) {
    const existed = await this.forecastRepository.findOne({
      quarter: data.quarter,
      year: data.year
    })
    if (existed) {
      throw new AppError(`Forecast for Q${data.quarter} ${data.year} already exists`, StatusCodes.CONFLICT)
    }

    const name = `IELTS Speaking Forecast Q${data.quarter} ${data.year}`
    const slug = generateSlug(name)

    const createData = {
      ...data,
      name,
      slug,
      thumbnailId: data.thumbnailId ? toObjectId(data.thumbnailId) : undefined
    }

    const forecast = await this.forecastRepository.create(createData)
    return this.forecastMapper.toResponse(forecast)
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

    const { data, pagination } = await this.forecastRepository.paginate(filter, page, limit, options)
    return {
      data: this.forecastMapper.toResponseList(data),
      pagination
    }
  }

  public async getDetails(id: string) {
    const forecast = await this.forecastRepository.findById(id, {
      populate: 'thumbnailId'
    })
    if (!forecast) throw new AppError('Forecast not found', StatusCodes.NOT_FOUND)
    return this.forecastMapper.toResponse(forecast)
  }

  public async findById(id: string) {
    const forecast = await this.forecastRepository.findById(id)
    if (!forecast) throw new AppError('Forecast not found', StatusCodes.NOT_FOUND)
    return forecast
  }

  public async getCurrentActiveForecast() {
    const forecast = await this.forecastRepository.findOne({ isDefault: true, status: FORECAST_STATUS.PUBLISHED })
    if (!forecast)
      throw new AppError('No active forecast is currently available', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    return forecast
  }
}
