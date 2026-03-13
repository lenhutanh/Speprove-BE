import { IBaseRepository } from '~/common/base/base.repository.interface'
import { Part2QuestionType, Part3QuestionType, QuestionType } from '../question.model'

export interface IQuestionRepository extends IBaseRepository<QuestionType> {
  createPart1Question(data: Partial<QuestionType>): Promise<QuestionType>
  createPart2Question(data: Partial<Part2QuestionType>): Promise<Part2QuestionType>
  createPart3Question(data: Partial<Part3QuestionType>): Promise<Part3QuestionType>
}
