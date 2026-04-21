import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IAttemptRepository } from './attempt.repository.interface'
import { AttemptQueryType, CreateAttemptBodyType, GetTopAttemptQueryType } from './attempt.type'
import { SpeakingSessionService } from '../speaking-session/speaking-session.service'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastQuestionService } from '../forecast-question/forecast-question.service'
import { FileService } from '../file/file.service'
import { getCreditCost, toObjectId } from '~/common/utils'
import { AttemptMapper } from './attempt.mapper'
import { ATTEMPT_STATUS, CREDIT_LOG_REF_TYPE, SPEAKING_SESSION_MODE } from '~/common/constants/constants'
import { SpeakingProducer } from '~/infrastructure/queues/publishers/speaking.producer'
import { AudioFileType } from '../file/file.model'
import { ForecastQuestionResponseDto } from '../forecast-question/forecast-question.dto'
import { QueryBuilder } from '~/common/base'
import { AttemptType } from './attempt.model'
import { AccountService } from '../account/account.service'
import { CreditLogService } from '../credit-log/credit-log.service'

@singleton()
export class AttemptService {
  constructor(
    @inject(TOKENS.IAttemptRepository) private readonly attemptRepository: IAttemptRepository,
    private readonly speakingSessionService: SpeakingSessionService,
    private readonly forecastQuestionService: ForecastQuestionService,
    private readonly fileService: FileService,
    private readonly attemptMapper: AttemptMapper,
    private readonly speakingProducer: SpeakingProducer,
    private readonly accountService: AccountService,
    private readonly creditLogService: CreditLogService
  ) {}

  public async createNew(userId: string, data: CreateAttemptBodyType) {
    const [forecastQuestion, audioFile] = await Promise.all([
      this.forecastQuestionService.getDetails(data.forecastQuestionId),
      this.fileService.findById(data.audioFileId) as unknown as AudioFileType
    ])

    if (audioFile.ownerId?.toString() !== userId) {
      throw new AppError('You do not own this audio file', StatusCodes.FORBIDDEN)
    }

    let speakingSession = null
    let calculatedOrder = 1

    if (data.mode === SPEAKING_SESSION_MODE.MOCK) {
      if (!data.speakingSessionId) {
        throw new AppError('Speaking session ID is required for mock mode', StatusCodes.BAD_REQUEST)
      }

      speakingSession = await this.speakingSessionService.findById(data.speakingSessionId)

      if (speakingSession.userId.toString() !== userId) {
        throw new AppError('You do not own this session', StatusCodes.FORBIDDEN)
      }

      if (speakingSession.status !== 0) {
        throw new AppError('Speaking session is not in progress', StatusCodes.BAD_REQUEST)
      }

      const allQuestionIds = [
        ...(speakingSession.questions.part1 || []),
        ...(speakingSession.questions.part2 || []),
        ...(speakingSession.questions.part3 || [])
      ].map((id) => id.toString())

      const questionIndex = allQuestionIds.indexOf(data.forecastQuestionId)

      if (questionIndex === -1) {
        throw new AppError('This question does not belong to the current mock session', StatusCodes.BAD_REQUEST)
      }

      calculatedOrder = questionIndex + 1
    }

    const attempt = await this.attemptRepository.withTransaction(async (session) => {
      if (data.mode === SPEAKING_SESSION_MODE.PRACTICE) {
        const pointsToDeduct = getCreditCost(data.mode, forecastQuestion.part)
        const account = await this.accountService.deductBalance(userId, pointsToDeduct, session)
        await this.creditLogService.create(
          {
            userId: toObjectId(userId),
            amount: -pointsToDeduct,
            reason: `Luyện tập Part ${forecastQuestion.part}: ${forecastQuestion.content}`,
            refType: CREDIT_LOG_REF_TYPE.USAGE,
            refId: forecastQuestion.id,
            balanceBefore: account.balance - pointsToDeduct,
            balanceAfter: account.balance
          },
          session
        )
      }
      const attemptPayload = {
        userId: toObjectId(userId),
        mode: data.mode,
        speakingSessionId: speakingSession ? speakingSession._id : null,
        audioFileId: toObjectId(data.audioFileId),
        forecastQuestionId: toObjectId(data.forecastQuestionId),
        part: forecastQuestion.part ?? null,
        order: calculatedOrder,
        status: ATTEMPT_STATUS.PENDING,
        speechMetrics: {},
        evaluation: {}
      }
      try {
        return await this.attemptRepository.createOrUpdateAttempt(attemptPayload)
      } catch (error: any) {
        if (error.message === 'PROCESSING_CONFLICT') {
          throw new AppError('This question is being processed, please wait', StatusCodes.CONFLICT)
        }
        throw error
      }
    })

    await this.speakingProducer.transcribe({
      attemptId: attempt!._id.toString(),
      audioUrl: audioFile.aiAudioUrl ?? audioFile.url,
      questionContent: this._getQuestionContent(forecastQuestion),
      part: forecastQuestion.part
    })

    return this.attemptMapper.toResponse(attempt!)
  }

  private _getQuestionContent(forecastQuestion: ForecastQuestionResponseDto): string {
    if (forecastQuestion.part === 2) {
      const bullets = (forecastQuestion.bulletPoints ?? []).map((b: any) => `- ${b}`).join('\n')
      return `${forecastQuestion.content}\n${bullets}`
    }

    if (forecastQuestion.part === 3) {
      return forecastQuestion.parent?.content
        ? `PART 2 TOPIC (context): ${forecastQuestion.parent.content}\n\nPART 3 QUESTION: ${forecastQuestion.content}`
        : forecastQuestion.content
    }

    return forecastQuestion.content
  }

  public async getDetails(userId: string, attemptId: string) {
    const attempt = await this.attemptRepository.findById(attemptId)
    if (!attempt) throw new AppError('Attempt not found', StatusCodes.NOT_FOUND)
    if (attempt.userId.toString() !== userId) throw new AppError('Forbidden', StatusCodes.FORBIDDEN)
    return this.attemptMapper.toResponse(attempt)
  }

  public async getList(userId: string, queryOptions: AttemptQueryType) {
    const { limit, page, sortBy, sortOrder, forecastQuestionId } = queryOptions || {}

    const qb = new QueryBuilder<AttemptType>()

    const { filter, options } = qb
      .applyFilters({ userId, forecastQuestionId })
      .populate('audioFileId')
      .sort(sortBy, sortOrder)
      .build()

    const { data, pagination } = await this.attemptRepository.paginate(filter, page, limit, options)

    return {
      data: this.attemptMapper.toResponseList(data),
      pagination
    }
  }

  public async getTopAttemptsByQuestion(data: GetTopAttemptQueryType) {
    const qb = new QueryBuilder<AttemptType>()

    const { filter, options } = qb
      .where('forecastQuestionId', data.forecastQuestionId)
      .where('status', ATTEMPT_STATUS.DONE)
      .where('isPublic', true)
      .whereGte('evaluation.overall', data.band)
      .whereLt('evaluation.overall', data.band + 1)
      .sort('evaluation.overall', 'desc')
      .sort('createdAt', 'desc')
      .limit(10)
      .populate('audioFileId')
      .populate({ path: 'userId', select: 'fullName avatar' })
      .build()

    const result = await this.attemptRepository.findMany(filter, options)
    return this.attemptMapper.toLeaderboardResponseList(result)
  }

  public async toggleShareStatus(userId: string, attemptId: string, isPublic: boolean) {
    const attempt = await this.attemptRepository.findById(attemptId)
    if (!attempt) throw new AppError('Attempt not found', StatusCodes.NOT_FOUND)
    if (attempt.userId.toString() !== userId) {
      throw new AppError('You do not own this attempt', StatusCodes.FORBIDDEN)
    }
    if (attempt.status !== ATTEMPT_STATUS.DONE) {
      throw new AppError('You can only share fully evaluated attempts', StatusCodes.BAD_REQUEST)
    }
    const updatedAttempt = await this.attemptRepository.updateById(attemptId, { isPublic })
    return this.attemptMapper.toResponse(updatedAttempt!)
  }
}
