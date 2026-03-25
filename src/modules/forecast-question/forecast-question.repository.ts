import { BaseRepository } from '~/common/base'
import { ForecastQuestion, ForecastQuestionType } from './forecast-question.model'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { singleton } from 'tsyringe'
import { PipelineStage, Types } from 'mongoose'
import { GetForecastQuestionType } from './forecast-question.validation'

@singleton()
export class ForecastQuestionRepository
  extends BaseRepository<ForecastQuestionType>
  implements IForecastQuestionRepository
{
  constructor() {
    super(ForecastQuestion)
  }

  public async getList(query: GetForecastQuestionType): Promise<any> {
    const { page, limit, search, forecastTopicId, part } = query ?? {}

    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastTopicId: new Types.ObjectId(forecastTopicId)
        }
      }
    ]

    pipeline.push(
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'questionId'
        }
      },
      { $unwind: '$questionId' }
    )

    if (part) {
      pipeline.push({
        $match: { 'questionId.part': Number(part) }
      })
    }

    if (search) {
      pipeline.push({
        $match: {
          'questionId.name': { $regex: search, $options: 'i' }
        }
      })
    }

    pipeline.push({ $sort: { order: 1 } })

    return this.aggregatePaginate(pipeline, page, limit)
  }
}
