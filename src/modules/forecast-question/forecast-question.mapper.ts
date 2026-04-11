import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionResponseDto } from './forecast-question.dto'

@singleton()
export class ForecastQuestionMapper extends BaseMapper<ForecastQuestionType, ForecastQuestionResponseDto> {
  toResponse(entity: any): ForecastQuestionResponseDto {
    const q = entity.q || entity.questionId
    const res: any = {
      id: entity._id.toString(),
      questionId: q._id.toString(),
      content: q.content,
      part: q.part,
      order: entity.order
    }

    if (q.part === 2) {
      res.category = q.category
      res.bulletPoints = q.bulletPoints || []
    }

    if (q.part === 3) {
      if (q.parentId) {
        if (typeof q.parentId === 'object' && q.parentId._id) {
          res.parent = this.toResponse({
            q: q.parentId,
            _id: q.parentId._id
          })
        } else {
          res.parent = q.parentId.toString()
        }
      }
    }

    return res
  }

  toDetailResponse(
    entity: any,
    audioUrl: string,
    neighbors?: {
      prev: { id: string; content: string } | null
      next: { id: string; content: string } | null
    }
  ): ForecastQuestionResponseDto {
    const baseResponse = this.toResponse(entity)
    baseResponse.audioUrl = audioUrl
    baseResponse.prev = neighbors?.prev ?? null
    baseResponse.next = neighbors?.next ?? null
    return baseResponse
  }

  toResponseList(entities: any[], currentPart?: any): ForecastQuestionResponseDto[] {
    const mapped = entities.map((e) => this.toResponse(e))

    const part1s = mapped.filter((q) => q.part === 1)
    const part2s = mapped.filter((q) => q.part === 2)
    const part3s = mapped.filter((q) => q.part === 3)

    const nestedPart2s = part2s.map((p2) => ({
      ...p2,
      childPart3: part3s
        .filter((p3) => p3.parent?.questionId === p2.questionId || p3.parent?.questionId === p2.questionId)
        .map((p3) => {
          const { parent, ...rest } = p3
          return rest
        })
    }))

    const partNum = currentPart ? Number(String(currentPart).split(',')[0]) : null

    if (partNum === 1) return part1s
    if (partNum === 3) return part3s

    if (!partNum) return [...part1s, ...nestedPart2s]

    return nestedPart2s
  }
}
