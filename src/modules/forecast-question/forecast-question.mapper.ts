import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionResponseDto } from './forecast-question.dto'
import { Part2QuestionType, Part3QuestionType, QuestionType } from '../question/question.model'
import { PartKind } from '~/common/constants/constants'

@singleton()
export class ForecastQuestionMapper extends BaseMapper<ForecastQuestionType, ForecastQuestionResponseDto> {
  toResponse(entity: ForecastQuestionType): ForecastQuestionResponseDto {
    const question = entity.questionId as unknown as QuestionType

    const base = {
      id: entity._id.toString(),
      forecastTopicId: entity.forecastTopicId.toString(),
      questionId: question._id.toString(),
      order: entity.order,
      content: question.content,
      part: question.part as 1 | 2 | 3
    }

    if (question.part === PartKind.TWO) {
      const p2 = question as unknown as Part2QuestionType
      return { ...base, bulletPoints: p2.bulletPoints ?? [] }
    }

    if (question.part === PartKind.THREE) {
      const p3 = question as unknown as Part3QuestionType
      const parent = p3.parentId as unknown as QuestionType
      return { ...base, part2Content: parent?.content ?? '' }
    }

    return base
  }
}
