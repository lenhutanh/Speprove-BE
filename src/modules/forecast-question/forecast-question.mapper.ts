import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionResponseDto } from './forecast-question.dto'

@singleton()
export class ForecastQuestionMapper extends BaseMapper<ForecastQuestionType, ForecastQuestionResponseDto> {
  toResponse(entity: any): ForecastQuestionResponseDto {
    const q = entity.q || entity.questionId
    if (!q) return {} as any

    const res: ForecastQuestionResponseDto = {
      id: entity._id.toString(),
      questionId: q._id?.toString() || q.id,
      content: q.content,
      part: q.part,
      order: entity.order,
      prev: entity.prev,
      next: entity.next
    }

    if (q.parentId) {
      res.parent = {
        id: q.parentId._id.toString(),
        questionId: q.parentId._id.toString(),
        content: q.parentId.content,
        part: q.parentId.part
      }
    }

    if (q.part === 2) {
      res.category = q.category
      res.bulletPoints = q.bulletPoints || []

      if (entity.followUpForecastQuestions && entity.followUpForecastQuestions.length > 0) {
        res.childPart3 = entity.followUpForecastQuestions.map((p3Record: any) => this.toResponse(p3Record))
      }
    }

    return res
  }
}
