import { BaseMapper } from '~/common/base'
import { VocabularySuggestionType } from './vocabulary-suggestion.model'
import { singleton } from 'tsyringe'
import { PublicVocabularySuggestionDto, VocabularySuggestionDto } from './vocabulary-suggestion.dto'

@singleton()
export class VocabularySuggestionMapper extends BaseMapper<VocabularySuggestionType, VocabularySuggestionDto> {
  toResponse(entity: VocabularySuggestionType): VocabularySuggestionDto {
    const question = this.getQuestionInfo(entity)

    return {
      id: entity._id.toString(),
      level: entity.level,
      example: entity.example,
      meaning: entity.meaningVi,
      questionId: question.id,
      source: entity.source,
      status: entity.status,
      text: entity.text,
      type: entity.type,
      occurrenceCount: entity.occurrenceCount ?? 0,
      lastOccurredAt: entity.lastOccurredAt,
      createdAt: (entity as any).createdAt,
      updatedAt: (entity as any).updatedAt,
      question: question.content || question.part ? question : undefined
    }
  }

  toPublicResponse(entity: VocabularySuggestionType): PublicVocabularySuggestionDto {
    return {
      id: entity._id.toString(),
      questionId: this.getQuestionInfo(entity).id,
      text: entity.text,
      type: entity.type,
      meaning: entity.meaningVi,
      example: entity.example,
      level: entity.level
    }
  }

  toPublicResponseList(entities: readonly VocabularySuggestionType[]): PublicVocabularySuggestionDto[] {
    return entities.map((entity) => this.toPublicResponse(entity))
  }

  private getQuestionInfo(entity: VocabularySuggestionType) {
    const question = entity.questionId as any
    const id = question?._id ? question._id.toString() : entity.questionId.toString()

    return {
      id,
      content: question?.content,
      part: question?.part
    }
  }
}
