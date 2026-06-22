import { StatusCodes } from 'http-status-codes'
import { CreateForecastBodyType, UpdateForecastBodyType } from '~/modules/forecast/types/forecast.type'
import { inject, singleton } from 'tsyringe'
import { QueryBuilder } from '~/common/base/query-builder'
import { TOKENS } from '~/common/constants/di.tokens'
import { IForecastRepository } from './repositories/forecast.repository.interface'
import { ForecastType } from './forecast.model'
import { AppError } from '~/common/errors'
import { ForecastMapper } from './forecast.mapper'
import { generateSlug, toObjectId } from '~/common/utils'
import { FORECAST_STATUS } from './forecast.constants'
import { ErrorCodes } from '~/common/constants/error-codes'
import { TopicService } from '../topic/topic.service'
import { QuestionService } from '../question/question.service'
import { IForecastTopicRepository } from '~/modules/forecast-topic/repositories/forecast-topic.repository.interface'
import { IForecastQuestionRepository } from '~/modules/forecast-question/forecast-question.repository.interface'
import { STATUS } from '~/common/constants/status.constants'
import { PART_KIND, PART2_CATEGORY, Part23CategoryValue } from '~/modules/question/question.constants'

@singleton()
export class ForecastService {
  constructor(
    @inject(TOKENS.IForecastRepository) private readonly forecastRepository: IForecastRepository,
    private readonly forecastMapper: ForecastMapper,
    private readonly topicService: TopicService,
    private readonly questionService: QuestionService,
    @inject(TOKENS.IForecastTopicRepository) private readonly forecastTopicRepository: IForecastTopicRepository,
    @inject(TOKENS.IForecastQuestionRepository) private readonly forecastQuestionRepository: IForecastQuestionRepository
  ) { }
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
    let forecast = await this.forecastRepository.findOne({ isDefault: true, status: FORECAST_STATUS.PUBLISHED })

    if (!forecast) {
      const activeForecasts = await this.forecastRepository.findMany(
        { status: FORECAST_STATUS.PUBLISHED },
        { sort: { year: -1, quarter: -1 }, limit: 1 }
      )
      if (activeForecasts && activeForecasts.length > 0) {
        forecast = activeForecasts[0]
      }
    }

    if (!forecast) {
      throw new AppError('No active forecast is currently available', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    return forecast
  }

  public async importForecast(data: any) {
    const { quarter, year, isDefault, part1, part23 } = data

    if (isDefault) {
      await this.forecastRepository.updateMany({ isDefault: true }, { isDefault: false })
    }

    const forecastName = `IELTS Speaking Forecast Q${quarter} ${year}`
    const forecastSlug = generateSlug(forecastName)

    let forecast = await this.forecastRepository.findOne({ quarter, year })
    if (!forecast) {
      forecast = await this.forecastRepository.create({
        name: forecastName,
        slug: forecastSlug,
        quarter,
        year,
        isDefault,
        status: FORECAST_STATUS.PUBLISHED
      })
    } else {
      forecast.isDefault = isDefault
      forecast.status = FORECAST_STATUS.PUBLISHED
      await this.forecastRepository.updateById(forecast._id.toString(), forecast)
    }

    await this.forecastTopicRepository.hardDeleteMany({ forecastId: forecast._id })
    await this.forecastQuestionRepository.hardDeleteMany({ forecastId: forecast._id })

    for (let tIndex = 0; tIndex < part1.length; tIndex++) {
      const item = part1[tIndex]

      const topic = await this.topicService.findOrCreate({
        name: item.topicName
      })

      const ft = await this.forecastTopicRepository.create({
        forecastId: forecast._id,
        topicId: topic._id,
        order: tIndex + 1
      })

      for (let qIndex = 0; qIndex < item.questions.length; qIndex++) {
        const qContent = item.questions[qIndex]

        const question = await this.questionService.findOrCreate({
          content: qContent,
          part: PART_KIND.ONE,
          topicId: topic._id.toString(),
          status: STATUS.ACTIVE
        })

        await this.forecastQuestionRepository.create({
          forecastId: forecast._id,
          forecastTopicId: ft._id,
          questionId: question._id,
          part: PART_KIND.ONE,
          order: qIndex + 1
        })
      }
    }

    for (let cardIndex = 0; cardIndex < part23.length; cardIndex++) {
      const item = part23[cardIndex]
      const category = item.category

      const part2Question = await this.questionService.findOrCreate({
        content: item.cueCard,
        part: PART_KIND.TWO,
        category,
        bulletPoints: item.bullets,
        status: STATUS.ACTIVE
      })

      await this.forecastQuestionRepository.create({
        forecastId: forecast._id,
        questionId: part2Question._id,
        part: PART_KIND.TWO,
        order: cardIndex + 1
      })

      for (let qIndex = 0; qIndex < item.part3Questions.length; qIndex++) {
        const qContent = item.part3Questions[qIndex]

        const part3Question = await this.questionService.findOrCreate({
          content: qContent,
          part: PART_KIND.THREE,
          parentId: part2Question._id.toString(),
          status: STATUS.ACTIVE
        })

        await this.forecastQuestionRepository.create({
          forecastId: forecast._id,
          questionId: part3Question._id,
          part: PART_KIND.THREE,
          order: qIndex + 1
        })
      }
    }

    return this.forecastMapper.toResponse(forecast)
  }


}
