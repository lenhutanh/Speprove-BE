import { StatusCodes } from 'http-status-codes'
import { CLOUD_FOLDERS, PartKind } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { VoiceService } from '../voice/voice.service'
import { TOKENS } from '~/common/constants/tokens'
import { IQuestionRepository } from './repositories/question.repository.interface'
import { QueryBuilder } from '~/common/base/query-builder'
import { QuestionType } from './question.model'
import { CreateQuestionBodyType, UpdateQuestionBodyType } from './types/question.type'
import { AppError } from '~/common/errors'
import { JOB_NAME } from '~/infrastructure/queues'
import { FileProducer } from '../../infrastructure/queues/publishers/file.producer'
import { checkSpelling, getSuggestions, toObjectId } from '~/common/utils'
import { QuestionMapper } from './question.mapper'

@singleton()
export class QuestionService {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly fileProducer: FileProducer,
    @inject(TOKENS.IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    private readonly questionMapper: QuestionMapper
  ) {}

  public async createNew(data: CreateQuestionBodyType) {
    const errors = checkSpelling(data.content)
    if (errors.length) {
      const suggestions = errors.map((w) => ({
        word: w,
        suggestion: getSuggestions(w)
      }))
      throw new AppError(`Spelling errors: ${JSON.stringify(suggestions)}`)
    }
    const createData = {
      ...data,
      topicId: toObjectId(data.topicId)
    }
    let question: QuestionType | null = null
    switch (data.part) {
      case PartKind.ONE:
        question = await this.questionRepository.createPart1Question(createData)
        break
      case PartKind.TWO:
        question = await this.questionRepository.createPart2Question(createData)
        break
      case PartKind.THREE:
        question = await this.questionRepository.createPart3Question({
          ...createData,
          parentId: toObjectId(data.parentId)
        })
        break
    }

    const voices = (await this.voiceService.getList()).data

    if (voices.length > 0) {
      const jobs = voices.map((voice) => ({
        name: JOB_NAME.QUESTION_AUDIO.GENERATE,
        data: {
          questionId: question._id,
          text: question.content,
          voiceCode: voice.voiceCode,
          voiceId: voice._id,
          speed: voice.speed,
          pitch: voice.pitch,
          folder: CLOUD_FOLDERS.QUESTION_AUDIOS
        }
      }))
      await this.fileProducer.addBulk(jobs)
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
