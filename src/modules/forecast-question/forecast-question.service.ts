import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { toObjectId } from '~/common/utils'
import { GetForecastQuestionType } from './forecast-question.validation'
import { ForecastQuestionMapper } from './forecast-question.mapper'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'

@singleton()
export class ForecastQuestionService {
  constructor(
    @inject(TOKENS.IForecastQuestionRepository)
    private readonly forecastQuestionRepository: IForecastQuestionRepository,
    private readonly forecastQuestionMapper: ForecastQuestionMapper
  ) {}

  public async importQuestions(forecastTopicId: string, questions: { questionId: string; order: number }[]) {
    const questionIds = questions.map((q) => toObjectId(q.questionId))

    await this.forecastQuestionRepository.withTransaction(async (session) => {
      await this.forecastQuestionRepository.hardDeleteMany(
        {
          forecastTopicId: toObjectId(forecastTopicId),
          questionId: { $nin: questionIds }
        },
        { session }
      )

      const ops = questions.map((item) => ({
        updateOne: {
          filter: {
            forecastTopicId: toObjectId(forecastTopicId),
            questionId: toObjectId(item.questionId)
          },
          update: {
            $set: { order: item.order }
          },
          upsert: true
        }
      }))

      if (ops.length > 0) {
        await this.forecastQuestionRepository.bulkWrite(ops, { session })
      }
    })
  }

  public async getList(query: GetForecastQuestionType) {
    const { data, pagination } = await this.forecastQuestionRepository.getList(query)
    return {
      data: this.forecastQuestionMapper.toResponseList(data),
      pagination
    }
  }

  public async getDetails(id: string) {
    const forecastQuestion = await this.forecastQuestionRepository.findById(id, {
      populate: { path: 'questionId', populate: { path: 'parentId' } }
    })
    if (!forecastQuestion) throw new AppError('Forecast question not found', StatusCodes.NOT_FOUND)
    return this.forecastQuestionMapper.toResponse(forecastQuestion)
  }
}
