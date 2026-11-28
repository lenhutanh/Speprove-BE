import { BaseRepository } from '~/core/persistence/base.repository'
import { ForecastQuestion, ForecastQuestionType } from './forecast-question.model'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { singleton } from 'tsyringe'
import { PipelineStage, Types } from 'mongoose'
import { ForecastQuestionQueryType } from './forecast-question.type'
import { PART_KIND } from '../question/question.constants'
import { PART_GROUP } from '../forecast/forecast.constants'

@singleton()
export class ForecastQuestionRepository
  extends BaseRepository<ForecastQuestionType>
  implements IForecastQuestionRepository
{
  constructor() {
    super(ForecastQuestion)
  }

  public async getRandomPart1Questions(forecastTopicId: string, limit: number): Promise<any> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastTopicId: new Types.ObjectId(forecastTopicId),
          part: PART_KIND.ONE
        }
      },
      {
        $sample: { size: limit }
      },
      {
        $sort: { order: 1 }
      },
      {
        $project: { _id: 1, forecastTopicId: 1, questionId: 1, part: 1 }
      }
    ]
    return await this.aggregate(pipeline)
  }

  public async getRandomPart2Question(forecastId: string, excludeIds: string[]): Promise<any> {
    const excludeObjectIds = excludeIds.map((id) => new Types.ObjectId(id))
    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastId: new Types.ObjectId(forecastId),
          part: PART_KIND.TWO,
          _id: { $nin: excludeObjectIds }
        }
      },
      {
        $sample: { size: 1 }
      },
      {
        $project: { _id: 1, questionId: 1, part: 1 }
      }
    ]
    const result = await this.aggregate(pipeline)
    return result.length > 0 ? result[0] : null
  }

  public async getRandomPart3Questions(forecastId: string, parentId: string, limit: number): Promise<any> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          forecastId: new Types.ObjectId(forecastId),
          part: PART_KIND.THREE
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          pipeline: [{ $match: { parentId: new Types.ObjectId(parentId) } }],
          as: 'question'
        }
      },
      { $match: { question: { $ne: [] } } },
      { $sample: { size: limit } },
      {
        $sort: { order: 1 }
      },
      {
        $project: { _id: 1, questionId: 1, part: 1 }
      }
    ]
    return await this.aggregate(pipeline)
  }

  public async getList(query: ForecastQuestionQueryType): Promise<any> {
    const { page, limit, search, forecastId, forecastTopicId, part, category } = query ?? {}

    const pipeline: PipelineStage[] = []

    const initialMatch: any = { forecastId: new Types.ObjectId(forecastId) }
    if (forecastTopicId) initialMatch.forecastTopicId = new Types.ObjectId(forecastTopicId)

    pipeline.push({ $match: initialMatch })

    pipeline.push(
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'q'
        }
      },
      { $unwind: '$q' }
    )

    if (part) {
      const partMapping = {
        [PART_GROUP.PART1]: [1],
        [PART_GROUP.PART23]: [2]
      }
      pipeline.push({ $match: { 'q.part': { $in: partMapping[part] } } })
    }

    pipeline.push({
      $lookup: {
        from: 'forecastquestions',
        let: { p2_id: '$questionId', f_id: '$forecastId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$forecastId', '$$f_id'] } } },
          {
            $lookup: {
              from: 'questions',
              localField: 'questionId',
              foreignField: '_id',
              as: 'q'
            }
          },
          { $unwind: '$q' },
          { $match: { $expr: { $eq: ['$q.parentId', '$$p2_id'] } } }
        ],
        as: 'followUpForecastQuestions'
      }
    })

    if (category) pipeline.push({ $match: { 'q.category': category } })
    if (search) pipeline.push({ $match: { 'q.content': { $regex: search, $options: 'i' } } })

    pipeline.push({
      $sort: { order: 1 }
    })

    return await this.aggregatePaginate(pipeline, page, limit)
  }
}
