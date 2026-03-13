import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ITopicRepository } from './repositories/topic.repository.interface'
import { QueryBuilder } from '~/common/base/query-builder'
import { TopicType } from './topic.model'
import { CreateTopicBodyType, UpdateTopicBodyType } from './types/topic.type'
import { AppError } from '~/common/errors'
import slugify from 'slugify'

@singleton()
export class TopicService {
  constructor(@inject(TOKENS.ITopicRepository) private readonly topicRepository: ITopicRepository) {}
  public async createNew(data: CreateTopicBodyType) {
    const slug = slugify(data.name, { lower: true, strict: true })

    const existed = await this.topicRepository.findOne({ slug })
    if (existed) {
      throw new AppError('Topic already exists', StatusCodes.CONFLICT)
    }

    return await this.topicRepository.create({ ...data, slug })
  }

  public async update(id: string, data: UpdateTopicBodyType) {
    const topic = await this.topicRepository.updateById(id, data)
    if (!topic) {
      throw new AppError('Topic not found', StatusCodes.NOT_FOUND)
    }
    return topic
  }

  public async getList(query?: any) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = query || {}
    const qb = new QueryBuilder<TopicType>()

    qb.applyFilters(filters, ['status', 'createdAt']).search(['name'], search).sort(sortBy, sortOrder)

    const { filter, options } = qb.build()

    return await this.topicRepository.paginate(filter, page, limit, options)
  }
}
