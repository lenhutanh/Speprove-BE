import { StatusCodes } from 'http-status-codes'
import { PART_KIND } from './question.constants'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IQuestionRepository } from './repositories/question.repository.interface'
import { QueryBuilder } from '~/common/base/query-builder'
import { QuestionType } from './question.model'
import { CreateQuestionBodyType, UpdateQuestionBodyType } from './types/question.type'
import { AppError } from '~/common/errors'
import { toObjectId } from '~/common/utils'
import { QuestionMapper } from './question.mapper'
import { checkSpelling, getSuggestions } from './question-spelling.service'

@singleton()
export class QuestionService {
  constructor(
    @inject(TOKENS.IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    private readonly questionMapper: QuestionMapper
  ) {}

  public async createNew(data: CreateQuestionBodyType) {
    const { errors, warnings } = checkSpelling(data.content)

    if (errors.length) {
      const suggestions = errors.map((w) => ({
        word: w,
        suggestion: getSuggestions(w)
      }))

      throw new AppError(`Spelling errors: ${JSON.stringify(suggestions)}`)
    }

    let question: QuestionType | null = null

    switch (data.part) {
      case PART_KIND.ONE:
        question = await this.questionRepository.createPart1Question({
          ...data,
          topicId: toObjectId(data.topicId)
        })
        break

      case PART_KIND.TWO:
        question = await this.questionRepository.createPart2Question(data)
        break

      case PART_KIND.THREE:
        question = await this.questionRepository.createPart3Question({
          ...data,
          parentId: toObjectId(data.parentId)
        })
        break
    }

    return this.questionMapper.toResponse(question)
  }

  public async update(id: string, data: UpdateQuestionBodyType) {
    const question = await this.questionRepository.updateById(id, data)
    if (!question) {
      throw new AppError('Question not found', StatusCodes.NOT_FOUND)
    }
    return question
  }

  public async getList(query: any) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = query || {}
    const qb = new QueryBuilder<QuestionType>()

    const { filter, options } = qb
      .applyFilters(filters, ['topicId', 'part', 'status', 'createdAt'])
      .search(['content'], search)
      .sort(sortBy, sortOrder)
      // .populate('topicId')
      .build()

    const { data, pagination } = await this.questionRepository.paginate(filter, page, limit, options)
    return {
      data: this.questionMapper.toResponseList(data),
      pagination
    }
  }
}
