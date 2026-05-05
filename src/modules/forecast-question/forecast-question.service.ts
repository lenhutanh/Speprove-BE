import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { toObjectId } from '~/common/utils'
import { ForecastQuestionMapper } from './forecast-question.mapper'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastQuestionQueryType, ImportQuestionType } from './forecast-question.type'
import { QuestionAudioService } from '../question-audio/question-audio.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { IQuestionRepository } from '../question/repositories/question.repository.interface'
import { PART_KIND, PartKind } from '~/common/constants/constants'

@singleton()
export class ForecastQuestionService {
  constructor(
    @inject(TOKENS.IForecastQuestionRepository)
    private readonly forecastQuestionRepository: IForecastQuestionRepository,
    private readonly forecastQuestionMapper: ForecastQuestionMapper,
    private readonly questionAudioService: QuestionAudioService,
    @inject(TOKENS.IQuestionRepository)
    private readonly questionRepository: IQuestionRepository
  ) {}

  public async importQuestions(data: ImportQuestionType) {
    const { forecastId, part, questionIds, forecastTopicId } = data
    if (part === PART_KIND.ONE && !forecastTopicId) {
      throw new AppError('forecastTopicId is required for Part 1', StatusCodes.BAD_REQUEST)
    }

    const forecastIdObj = toObjectId(forecastId)
    const targetQuestionIds = questionIds.map((id) => toObjectId(id))

    const validQuestions = await this.questionRepository.findMany({
      _id: { $in: targetQuestionIds },
      part
    })

    if (validQuestions.length !== questionIds.length) {
      throw new AppError(`Dữ liệu câu hỏi Part ${part} không khớp hoặc không tồn tại`, StatusCodes.BAD_REQUEST)
    }

    const topicIdObj = part === PART_KIND.ONE && forecastTopicId ? toObjectId(forecastTopicId) : undefined

    await this.forecastQuestionRepository.withTransaction(async (session) => {
      const deleteFilter: any = { forecastId: forecastIdObj, part: part }
      if (part === PART_KIND.ONE && forecastTopicId) {
        deleteFilter.forecastTopicId = topicIdObj
      }
      await this.forecastQuestionRepository.hardDeleteMany(deleteFilter, { session })

      const ops = questionIds.map((id, index) => ({
        updateOne: {
          filter: { forecastId: forecastIdObj, questionId: toObjectId(id), part: part },
          update: {
            $set: {
              order: index,
              forecastTopicId: topicIdObj
            }
          },
          upsert: true
        }
      }))

      await this.forecastQuestionRepository.bulkWrite(ops, { session })
    })
  }

  public async getList(query: ForecastQuestionQueryType) {
    const { data, pagination } = await this.forecastQuestionRepository.getList(query)
    return {
      data: this.forecastQuestionMapper.toResponseList(data),
      pagination
    }
  }

  public async getDetails(id: string, voiceId?: string) {
    const current = await this.forecastQuestionRepository.findById(id, {
      populate: {
        path: 'questionId',
        populate: { path: 'parentId' }
      }
    })

    if (!current) {
      throw new AppError('Question not found', StatusCodes.NOT_FOUND)
    }

    const [navigation, audioUrl] = await Promise.all([
      this.getPrevNext(current),
      voiceId
        ? this.questionAudioService.getAudioUrl({
            questionId: current.questionId._id.toString(),
            voiceId
          })
        : Promise.resolve('')
    ])

    return this.forecastQuestionMapper.toResponse({
      ...current,
      audioUrl,
      prev: navigation.prev,
      next: navigation.next
    })
  }

  private async getPrevNext(current: any) {
    const baseFilter = await this.buildNavigationFilter(current)

    const [prev, next] = await Promise.all([
      this.forecastQuestionRepository.findOne(
        {
          ...baseFilter,
          order: { $lt: current.order }
        },
        {
          sort: { order: -1 },
          populate: { path: 'questionId', select: 'content' }
        }
      ),

      this.forecastQuestionRepository.findOne(
        {
          ...baseFilter,
          order: { $gt: current.order }
        },
        {
          sort: { order: 1 },
          populate: { path: 'questionId', select: 'content' }
        }
      )
    ])

    return {
      prev: prev ? { id: prev._id.toString(), content: (prev.questionId as any).content } : null,
      next: next ? { id: next._id.toString(), content: (next.questionId as any).content } : null
    }
  }

  private async buildNavigationFilter(current: any) {
    const filter: any = {
      forecastId: current.forecastId,
      part: current.part
    }

    if (current.part === PART_KIND.ONE) {
      filter.forecastTopicId = current.forecastTopicId
      return filter
    }

    if (current.part === PART_KIND.TWO) {
      const questionIds = await this.getPart2QuestionIdsByCategory(current.questionId.category)

      filter.questionId = { $in: questionIds }
      return filter
    }

    if (current.part === PART_KIND.THREE) {
      const questionIds = await this.getPart3QuestionIdsByParent(current.questionId.parentId)

      filter.questionId = { $in: questionIds }
      return filter
    }

    return filter
  }

  private async getPart2QuestionIdsByCategory(category: string) {
    const questions = await this.questionRepository.findMany(
      {
        part: PART_KIND.TWO,
        category
      },
      {
        select: '_id'
      }
    )

    return questions.map((item: any) => item._id)
  }

  private async getPart3QuestionIdsByParent(parentId: string) {
    const questions = await this.questionRepository.findMany(
      {
        part: PART_KIND.THREE,
        parentId
      },
      {
        select: '_id'
      }
    )

    return questions.map((item: any) => item._id)
  }

  public async getRandomPart1Questions(forecastTopicId: string, limit: number) {
    return await this.forecastQuestionRepository.getRandomPart1Questions(forecastTopicId, limit)
  }

  public async getRandomPart2Question(forecastId: string, excludeIds: string[]) {
    const result = await this.forecastQuestionRepository.getRandomPart2Question(forecastId, excludeIds)
    if (!result) throw new AppError('No part 2 question can be found', StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND)
    return result
  }

  public async getRandomPart3Questions(forecastId: string, parentId: string, limit: number) {
    return await this.forecastQuestionRepository.getRandomPart3Questions(forecastId, parentId, limit)
  }
}
