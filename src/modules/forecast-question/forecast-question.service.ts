import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { toObjectId } from '~/common/utils'
import { ForecastQuestionMapper } from './forecast-question.mapper'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastQuestionQueryType } from './forecast-question.type'
import { QuestionAudioService } from '../question-audio/question-audio.service'

@singleton()
export class ForecastQuestionService {
  constructor(
    @inject(TOKENS.IForecastQuestionRepository)
    private readonly forecastQuestionRepository: IForecastQuestionRepository,
    private readonly forecastQuestionMapper: ForecastQuestionMapper,
    private readonly questionAudioService: QuestionAudioService
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

  public async getList(query: ForecastQuestionQueryType) {
    const { data, pagination } = await this.forecastQuestionRepository.getList(query)
    return {
      data: this.forecastQuestionMapper.toResponseList(data, query.part),
      pagination
    }
  }

  public async getDetails(id: string, voiceId?: string) {
    const forecastQuestion = await this.forecastQuestionRepository.findById(id, {
      populate: { path: 'questionId', populate: { path: 'parentId' } }
    })

    if (!forecastQuestion) throw new AppError('Question not found', StatusCodes.NOT_FOUND)

    const [prev, next, audioUrl] = await Promise.all([
      this.forecastQuestionRepository.findOne(
        {
          forecastTopicId: forecastQuestion.forecastTopicId,
          part: forecastQuestion.part,
          order: { $lt: forecastQuestion.order }
        },
        { sort: { order: -1 }, populate: { path: 'questionId', select: 'content' } }
      ),
      this.forecastQuestionRepository.findOne(
        {
          forecastTopicId: forecastQuestion.forecastTopicId,
          part: forecastQuestion.part,
          order: { $gt: forecastQuestion.order }
        },
        { sort: { order: 1 }, populate: { path: 'questionId', select: 'content' } }
      ),
      voiceId
        ? this.questionAudioService.getAudioUrl({
            questionId: forecastQuestion.questionId._id.toString(),
            voiceId
          })
        : Promise.resolve('')
    ])

    return this.forecastQuestionMapper.toDetailResponse(forecastQuestion, audioUrl, {
      prev: prev ? { id: prev._id.toString(), content: (prev.questionId as any).content } : null,
      next: next ? { id: next._id.toString(), content: (next.questionId as any).content } : null
    })
  }
}
