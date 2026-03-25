import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionResponseDto } from './forecast-question.dto'
import { QuestionType } from '../question/question.model'

@singleton()
export class ForecastQuestionMapper extends BaseMapper<ForecastQuestionType, ForecastQuestionResponseDto> {
  toResponse(entity: ForecastQuestionType): ForecastQuestionResponseDto {
    const question = entity.questionId as unknown as QuestionType

    return {
      id: entity._id.toString(),
      forecastTopicId: entity.forecastTopicId.toString(),
      questionId: question._id.toString(),
      order: entity.order,
      content: question.content,
      part: question.part as 1 | 2 | 3
    }
  }
}
