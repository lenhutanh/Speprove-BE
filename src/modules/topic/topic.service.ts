import { StatusCodes } from 'http-status-codes'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ITopicRepository } from './repositories/topic.repository.interface'
import { QueryBuilder } from '~/common/base/query-builder'
import { TopicType } from './topic.model'
import { CreateTopicBodyType, UpdateTopicBodyType } from './types/topic.type'
import { AppError } from '~/common/errors'
import { TopicMapper } from './topic.mapper'
import { generateSlug } from '~/common/utils'

@singleton()
export class TopicService {
  constructor(
    @inject(TOKENS.ITopicRepository) private readonly topicRepository: ITopicRepository,
    private readonly topicMapper: TopicMapper
  ) {}
  public async createNew(data: CreateTopicBodyType) {
    const slug = generateSlug(data.name)

    const existed = await this.topicRepository.findOne({ slug })
    if (existed) {
      throw new AppError('Topic already exists', StatusCodes.CONFLICT)
    }

    const topic = await this.topicRepository.create({ ...data, slug })
    return this.topicMapper.toResponse(topic)
  }

  public async findOrCreate(data: CreateTopicBodyType) {
    const slug = generateSlug(data.name)

    const existed = await this.topicRepository.findOne({ slug })
    if (existed) {
      return existed
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

    const { data, pagination } = await this.topicRepository.paginate(filter, page, limit, options)

    return {
      data: this.topicMapper.toResponseList(data),
      pagination
    }
  }
}
