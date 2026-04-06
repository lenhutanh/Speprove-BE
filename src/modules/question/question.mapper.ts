import { BaseMapper } from '~/common/base'
import { Part2QuestionType, Part3QuestionType, QuestionType } from './question.model'
import { QuestionResponseDto } from './question.dto'

export class QuestionMapper extends BaseMapper<QuestionType, QuestionResponseDto> {
  toResponse(entity: any): QuestionResponseDto {
    const response: QuestionResponseDto = {
      id: entity._id.toString(),
      content: entity.content,
      part: entity.part,
      status: entity.status,
      topicId: entity.topicId?._id?.toString() || entity.topicId?.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    if (entity.part === 2) {
      const p2 = entity as Part2QuestionType
      response.category = p2.category
      response.bulletPoints = p2.bulletPoints || []
    }

    if (entity.part === 3) {
      const p3 = entity as Part3QuestionType
      response.parentId = p3.parentId?._id?.toString() || p3.parentId?.toString()
    }

    return response
  }
}
