import { StatusCodes } from 'http-status-codes'
import { Forecast } from '~/models'
import { CreateForecastBodyType, UpdateForecastBodyType } from '~/types/forecast.type'
import { generateUniqueSlug, getSearchQuery } from '~/utils'
import { ApiError } from '~/utils/api-error'

const createNew = async (data: CreateForecastBodyType) => {
  const existed = await Forecast.findOne({ name: data.name })
  if (existed) throw new ApiError(StatusCodes.CONFLICT, 'Forecast name already exists')

  let slug = await generateUniqueSlug(Forecast, data.name)
  return await Forecast.create({ ...data, slug })
}

const update = async (id: string, data: UpdateForecastBodyType) => {
  const forecast = await Forecast.findById(id)
  if (!forecast) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Forecast not found')
  }

  if (data.name && data.name !== forecast.name) {
    const nameExisted = await Forecast.findOne({ name: data.name, _id: { $ne: id } })
    if (nameExisted) throw new ApiError(StatusCodes.CONFLICT, 'Forecast name already exists')

    forecast.slug = await generateUniqueSlug(Forecast, data.name)
  }

  Object.assign(forecast, data)

  return await forecast.save()
}

const getList = async (queryData: any) => {
  const { page, limit, skip, sort, search, filters } = queryData
  const mongoFilter: any = {
    ...filters,
    ...getSearchQuery(search, ['name'])
  }

  const [items, totalElements] = await Promise.all([
    Forecast.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
    Forecast.countDocuments(mongoFilter)
  ])

  return {
    items,
    meta: {
      totalElements,
      totalPages: Math.ceil(totalElements / limit)
    }
  }
}

export const forecastService = {
  createNew,
  update,
  getList
}
