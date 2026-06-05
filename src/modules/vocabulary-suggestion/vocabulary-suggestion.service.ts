import { StatusCodes } from 'http-status-codes'
import { inject, singleton } from 'tsyringe'
import { QueryBuilder } from '~/common/base'
import {
  VocabularyBandLevel,
  VocabularySuggestionStatus,
  VOCABULARY_SUGGESTION_SOURCE,
  VOCABULARY_SUGGESTION_STATUS
} from './vocabulary-suggestion.constants'
import { TOKENS } from '~/common/constants/di.tokens'
import { AppError } from '~/common/errors'
import { toObjectId } from '~/common/utils'
import { VocabularySuggestionType } from './vocabulary-suggestion.model'
import { IVocabularySuggestionRepository } from './vocabulary-suggestion.repository.interface'
import {
  CreateVocabularySuggestionData,
  UpdateVocabularySuggestionData,
  VocabularySuggestionQuery
} from './vocabulary-suggestion.type'
import { VocabularySuggestionMapper } from './vocabulary-suggestion.mapper'

type GetApprovedByQuestionOptions = {
  questionId: string
  bandLevel?: VocabularyBandLevel
  limit?: number
}

@singleton()
export class VocabularySuggestionService {
  constructor(
    @inject(TOKENS.IVocabularySuggestionRepository)
    private readonly vocabularySuggestionRepository: IVocabularySuggestionRepository,
    private readonly vocabularySuggestionMapper: VocabularySuggestionMapper
  ) {}

  public async createManual(data: CreateVocabularySuggestionData) {
    const normalizedText = this.normalizeText(data.text)
    const existed = await this.vocabularySuggestionRepository.findOne({
      questionId: toObjectId(data.questionId),
      normalizedText
    })

    if (existed) {
      throw new AppError('Vocabulary suggestion already exists for this question', StatusCodes.CONFLICT)
    }

    const result = await this.vocabularySuggestionRepository.create({
      questionId: toObjectId(data.questionId),
      normalizedText,
      text: this.cleanText(data.text),
      type: data.type,
      meaningVi: data.meaningVi.trim(),
      example: data.example.trim(),
      bandLevel: data.bandLevel,
      status: data.status ?? VOCABULARY_SUGGESTION_STATUS.APPROVED,
      source: VOCABULARY_SUGGESTION_SOURCE.ADMIN,
      occurrenceCount: 0
    })

    return this.vocabularySuggestionMapper.toResponse(result)
  }

  public async getList(query: VocabularySuggestionQuery) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = query

    const qb = new QueryBuilder<VocabularySuggestionType>()
    const { filter, options } = qb
      .applyFilters(filters, ['questionId', 'status', 'source', 'type', 'bandLevel'])
      .search(['text', 'normalizedText', 'meaningVi', 'example'], search ?? '')
      .sort(sortBy ?? 'createdAt', sortOrder ?? 'desc')
      .populate({ path: 'questionId', select: 'content part' })
      .build()

    const { data, pagination } = await this.vocabularySuggestionRepository.paginate(filter, page, limit, options)
    return {
      data: this.vocabularySuggestionMapper.toResponseList(data),
      pagination
    }
  }

  public async getApprovedByQuestion(options: GetApprovedByQuestionOptions) {
    const limit = Math.min(Math.max(options.limit ?? 10, 1), 50)
    const filter: Record<string, unknown> = {
      questionId: toObjectId(options.questionId),
      status: VOCABULARY_SUGGESTION_STATUS.APPROVED
    }

    if (options.bandLevel) {
      filter.bandLevel = options.bandLevel
    }

    const result = await this.vocabularySuggestionRepository.findMany(filter as any, {
      limit,
      sort: {
        occurrenceCount: -1,
        bandLevel: -1,
        lastOccurredAt: -1,
        createdAt: -1
      }
    })

    return this.vocabularySuggestionMapper.toPublicResponseList(result)
  }

  public async upsertExtractedSuggestion(data: CreateVocabularySuggestionData) {
    const normalizedText = this.normalizeText(data.text)

    return await this.vocabularySuggestionRepository.updateOne(
      {
        questionId: toObjectId(data.questionId),
        normalizedText
      },
      {
        $set: {
          lastOccurredAt: new Date()
        },
        $setOnInsert: {
          questionId: toObjectId(data.questionId),
          normalizedText,
          text: this.cleanText(data.text),
          type: data.type,
          meaningVi: data.meaningVi.trim(),
          example: data.example.trim(),
          bandLevel: data.bandLevel,
          status: VOCABULARY_SUGGESTION_STATUS.PENDING,
          source: VOCABULARY_SUGGESTION_SOURCE.LLM
        },
        $inc: {
          occurrenceCount: 1
        }
      },
      { upsert: true }
    )
  }

  public async update(id: string, data: UpdateVocabularySuggestionData) {
    const updateData: Record<string, unknown> = { ...data }

    if (data.text) {
      updateData.text = this.cleanText(data.text)
      updateData.normalizedText = this.normalizeText(data.text)
    }

    if (data.meaningVi) updateData.meaningVi = data.meaningVi.trim()
    if (data.example) updateData.example = data.example.trim()

    const updated = await this.vocabularySuggestionRepository.updateById(id, updateData)
    if (!updated) throw new AppError('Vocabulary suggestion not found', StatusCodes.NOT_FOUND)

    return updated
  }

  public async approve(id: string) {
    return await this.changeStatus(id, VOCABULARY_SUGGESTION_STATUS.APPROVED)
  }

  public async hide(id: string) {
    return await this.changeStatus(id, VOCABULARY_SUGGESTION_STATUS.HIDDEN)
  }

  public normalizeText(text: string) {
    return this.cleanText(text)
      .toLowerCase()
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\s+/g, ' ')
  }

  private async changeStatus(id: string, status: VocabularySuggestionStatus) {
    const updated = await this.vocabularySuggestionRepository.updateById(id, { status })
    if (!updated) throw new AppError('Vocabulary suggestion not found', StatusCodes.NOT_FOUND)

    return updated
  }

  private cleanText(text: string) {
    return text.trim().replace(/\s+/g, ' ')
  }
}

