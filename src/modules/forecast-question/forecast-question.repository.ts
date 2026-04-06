import { BaseRepository } from '~/common/base'
import { ForecastQuestion, ForecastQuestionType } from './forecast-question.model'
import { IForecastQuestionRepository } from './forecast-question.repository.interface'
import { singleton } from 'tsyringe'
import { PipelineStage, Types } from 'mongoose'
import { ForecastQuestionQueryType } from './forecast-question.type'

@singleton()
export class ForecastQuestionRepository
  extends BaseRepository<ForecastQuestionType>
  implements IForecastQuestionRepository
{
  constructor() {
    super(ForecastQuestion)
  }

  public async getList(query: ForecastQuestionQueryType): Promise<any> {
    const { page, limit, search, forecastTopicId, part, sortBy, sortOrder } = query ?? {}

    // 1. Khởi tạo Pipeline
    const pipeline: PipelineStage[] = [
      { $match: { forecastTopicId: new Types.ObjectId(forecastTopicId) } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'q'
        }
      },
      { $unwind: '$q' }
    ]

    // 2. Filter theo Search & Part
    if (search) {
      pipeline.push({ $match: { 'q.content': { $regex: search, $options: 'i' } } })
    }

    if (part) {
      // Nếu chọn Part 2 hoặc 3, ta lấy cả 2 để đảm bảo tính liên kết
      const parts = String(part).split(',').map(Number)
      const filterParts = parts.includes(2) || parts.includes(3) ? [2, 3] : [1]
      pipeline.push({ $match: { 'q.part': { $in: filterParts } } })
    }

    pipeline.push({
      $match: { 'q.part': { $in: [1, 2] } }
    })

    // 4. Sort theo Order và Part
    const direction = sortOrder === 'desc' ? -1 : 1
    pipeline.push({ $sort: { [sortBy || 'order']: direction, 'q.part': 1 } })

    // Thực hiện phân trang trên danh sách P1 & P2
    const result = await this.aggregatePaginate(pipeline, page, limit)

    // 5. SAU KHI PHÂN TRANG: Kéo theo Part 3 của những câu P2 đã tìm được
    const p2Ids = result.data.filter((i: any) => i.q.part === 2).map((i: any) => i.questionId)

    if (p2Ids.length > 0) {
      const part3s = await this.model.aggregate([
        { $match: { forecastTopicId: new Types.ObjectId(forecastTopicId) } },
        { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $match: { 'q.part': 3, 'q.parentId': { $in: p2Ids } } }
      ])
      result.data = [...result.data, ...part3s]
    }

    return result
  }
}
