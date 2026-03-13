import { BaseRepository } from '~/common/base/base.repository'
import { Part2QuestionType, Part3QuestionType, Question, QuestionType } from '../question.model'
import { IQuestionRepository } from './question.repository.interface'
import { PartKind } from '~/common/constants/constants'

export class QuestionRepository extends BaseRepository<QuestionType> implements IQuestionRepository {
  constructor() {
    super(Question)
  }

  public async createPart1Question(data: Partial<QuestionType>): Promise<QuestionType> {
    const question = await this.create({
      ...data,
      part: PartKind.ONE
    })
    return question as QuestionType
  }

  public async createPart2Question(data: Partial<Part2QuestionType>): Promise<Part2QuestionType> {
    const question = await this.create({
      ...data,
      part: PartKind.TWO
    })
    return question as Part2QuestionType
  }

  public async createPart3Question(data: Partial<Part3QuestionType>): Promise<Part3QuestionType> {
    const question = await this.create({
      ...data,
      part: PartKind.THREE
    })
    return question as Part3QuestionType
  }
}
