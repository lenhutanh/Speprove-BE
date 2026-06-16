import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ISpeakingSessionRepository } from './speaking-session.repository.interface'
import { CreateSpeakingSessionBodyType, SpeakingSessionQueryType } from './speaking-session.type'
import { toObjectId } from '~/common/utils'
import { SpeakingSessionMapper } from './speaking-session.mapper'
import { ForecastService } from '../forecast/forecast.service'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { VoiceService } from '../voice/voice.service'
import { ForecastTopicService } from '../forecast-topic/forecast-topic.service'
import { ForecastQuestionService } from '../forecast-question/forecast-question.service'
import { AccountService } from '../account/account.service'
import { CreditLogService } from '../credit-log/credit-log.service'
import { QueryBuilder } from '~/common/base'
import { SpeakingSessionType } from './speaking-session.model'
import { AttemptService } from '../attempt/attempt.service'
import { GeneratedAudioService } from '../generated-audio/generated-audio.service'
import { PART_KIND } from '../question/question.constants'
import {
  SESSION_STATUS,
  SPEAKING_SESSION_TYPE,
  MAX_RETRY,
  INSTRUCTION_KEYS,
  INSTRUCTION_SCRIPTS,
  InstructionKey
} from './speaking-session.constants'
import { CREDIT_LOG_REF_TYPE } from '../credit-log/credit-log.constants'
import { calculateCreditCost } from '../credit-log/credit.util'
import { ATTEMPT_STATUS } from '../attempt/attempt.constants'
import { SpeakingProducer } from '~/infrastructure/queues/publishers/speaking.producer'

@singleton()
export class SpeakingSessionService {
  constructor(
    @inject(TOKENS.ISpeakingSessionRepository) private readonly speakingSessionRepository: ISpeakingSessionRepository,
    private readonly speakingSessionMapper: SpeakingSessionMapper,
    private readonly forecastService: ForecastService,
    private readonly voiceService: VoiceService,
    private readonly forecastTopicService: ForecastTopicService,
    private readonly forecastQuestionService: ForecastQuestionService,
    private readonly accountService: AccountService,
    private readonly creditLogService: CreditLogService,
    private readonly attemptService: AttemptService,
    private readonly generatedAudioService: GeneratedAudioService,
    private readonly speakingProducer: SpeakingProducer
  ) {}

  public async createNew(userId: string, data: CreateSpeakingSessionBodyType) {
    const [voice, activeForecast, recentSpeakingSessions] = await Promise.all([
      data.voiceId ? this.voiceService.findActiveById(data.voiceId) : this.voiceService.getRandomVoice(),
      this.forecastService.getCurrentActiveForecast(),
      this.getRecentSpeakingSessions(userId, 3)
    ])

    const questions: any = {}

    if (data.type === SPEAKING_SESSION_TYPE.MOCK_PART_1 || data.type === SPEAKING_SESSION_TYPE.FULL_TEST) {
      const excludeTopicIds = recentSpeakingSessions
        .flatMap((s) => s.questions?.part1?.map((t) => t.forecastTopicId?.toString()) || [])
        .filter((id): id is string => !!id)

      const part1Topics = await this.forecastTopicService.getRandomTopics(
        activeForecast._id.toString(),
        excludeTopicIds,
        3
      )

      const part1QuestionsPromises = part1Topics.map((topic: any) =>
        this.forecastQuestionService.getRandomPart1Questions(topic._id.toString(), 3)
      )

      const part1QuestionsArray = await Promise.all(part1QuestionsPromises)

      questions.part1 = part1Topics.map((topic: any, index: number) => ({
        forecastTopicId: topic._id,
        forecastQuestionIds: part1QuestionsArray[index].map((q: any) => q._id)
      }))
    }

    if (data.type !== SPEAKING_SESSION_TYPE.MOCK_PART_1) {
      const excludePart2QuestionIds = recentSpeakingSessions
        .map((s) => s.questions?.part2?.toString())
        .filter((id): id is string => !!id)

      const part2Question = await this.forecastQuestionService.getRandomPart2Question(
        activeForecast._id.toString(),
        excludePart2QuestionIds
      )

      if (data.type !== SPEAKING_SESSION_TYPE.MOCK_PART_3) {
        questions.part2 = part2Question._id
      }

      if (data.type !== SPEAKING_SESSION_TYPE.MOCK_PART_2) {
        const part3Questions = await this.forecastQuestionService.getRandomPart3Questions(
          activeForecast._id.toString(),
          part2Question.questionId.toString(),
          4
        )
        questions.part3 = part3Questions.map((q: any) => q._id)
      }
    }

    const speakingSession = await this.speakingSessionRepository.withTransaction(async (session) => {
      const pointsToDeduct = calculateCreditCost(data.type)
      const account = await this.accountService.deductBalance(userId, pointsToDeduct, session)

      const createdSession = await this.speakingSessionRepository.create(
        {
          userId: toObjectId(userId),
          forecastId: activeForecast._id,
          voiceId: voice._id,
          questions,
          type: data.type
        },
        { session }
      )

      await this.creditLogService.create(
        {
          userId,
          amount: -pointsToDeduct,
          reason: `Thi thử`,
          refType: CREDIT_LOG_REF_TYPE.USAGE,
          refId: createdSession._id,
          balanceBefore: account.balance + pointsToDeduct,
          balanceAfter: account.balance
        },
        session
      )

      return createdSession
    })

    return this.speakingSessionMapper.toResponse(speakingSession)
  }

  public async findById(speakingSessionId: string) {
    const session = await this.speakingSessionRepository.findById(speakingSessionId)
    if (!session) throw new AppError('Speaking session not found', StatusCodes.NOT_FOUND)

    return session
  }

  public async getList(userId: string, queryOptions: SpeakingSessionQueryType) {
    const { limit, page, sortBy, sortOrder, forecastId } = queryOptions || {}

    const qb = new QueryBuilder<SpeakingSessionType>()

    const { filter, options } = qb.applyFilters({ userId, forecastId }).sort(sortBy, sortOrder).build()

    const { data, pagination } = await this.speakingSessionRepository.paginate(filter, page, limit, options)

    return {
      data: this.speakingSessionMapper.toResponseList(data),
      pagination
    }
  }

  public async getDetails(userId: string, speakingSessionId: string) {
    const session = await this.findById(speakingSessionId)
    if (session.userId.toString() !== userId) {
      throw new AppError('You do not own this session', StatusCodes.FORBIDDEN)
    }
    return this.speakingSessionMapper.toResponse(session)
  }

  public async getActiveSession(userId: string) {
    return await this.speakingSessionRepository.findOne(
      {
        userId: toObjectId(userId),
        status: { $in: [SESSION_STATUS.NOT_STARTED, SESSION_STATUS.IN_PROGRESS] }
      },
      { sort: { createdAt: -1 } }
    )
  }

  private async getRecentSpeakingSessions(userId: string, limit: number) {
    return await this.speakingSessionRepository.findMany({ userId }, { limit })
  }

  public async getCurrentQuestion(userId: string, speakingSessionId: string) {
    const speakingSession = await this.findById(speakingSessionId)

    if (speakingSession.userId.toString() !== userId) {
      throw new AppError('You do not own this session', StatusCodes.FORBIDDEN)
    }

    if (speakingSession.status === SESSION_STATUS.COMPLETED || speakingSession.status === SESSION_STATUS.PROCESSING) {
      const wellDoneAudio = await this.generatedAudioService.getOrCreate({
        text: INSTRUCTION_SCRIPTS.wellDone,
        voiceId: speakingSession.voiceId.toString()
      })
      return {
        isFinished: true,
        instruction: wellDoneAudio.audioUrl,
        question: null
      }
    }

    const flatQuestions: Array<{ id: string; part: number; forecastTopicId: string | null }> = []

    if (speakingSession.questions.part1 && speakingSession.questions.part1.length > 0) {
      const p1 = speakingSession.questions.part1.flatMap((topic) =>
        topic.forecastQuestionIds.map((qId) => ({
          id: qId.toString(),
          part: PART_KIND.ONE,
          forecastTopicId: topic.forecastTopicId?.toString() || null
        }))
      )
      flatQuestions.push(...p1)
    }

    if (speakingSession.questions.part2) {
      flatQuestions.push({
        id: speakingSession.questions.part2.toString(),
        part: PART_KIND.TWO,
        forecastTopicId: null
      })
    }

    if (speakingSession.questions.part3 && speakingSession.questions.part3.length > 0) {
      const p3 = speakingSession.questions.part3.map((qId) => ({
        id: qId.toString(),
        part: PART_KIND.THREE,
        forecastTopicId: null
      }))
      flatQuestions.push(...p3)
    }

    const index = speakingSession.currentQuestionIndex
    if (index >= flatQuestions.length) {
      const wellDoneAudio = await this.generatedAudioService.getOrCreate({
        text: INSTRUCTION_SCRIPTS.wellDone,
        voiceId: speakingSession.voiceId.toString()
      })
      return {
        isFinished: true,
        instruction: wellDoneAudio.audioUrl,
        question: null
      }
    }

    const currentContext = flatQuestions[index]

    const questionDetails = await this.forecastQuestionService.getDetails(currentContext.id)

    let playTransitionKey: InstructionKey | null = null
    if (index === 0) {
      if (currentContext.part === PART_KIND.ONE) playTransitionKey = INSTRUCTION_KEYS.PART1_INTRO
      if (currentContext.part === PART_KIND.TWO) playTransitionKey = INSTRUCTION_KEYS.PART2_INTRO
      if (currentContext.part === PART_KIND.THREE) playTransitionKey = INSTRUCTION_KEYS.PART3_INTRO
    } else {
      const prevContext = flatQuestions[index - 1]
      if (currentContext.part > prevContext.part) {
        playTransitionKey =
          currentContext.part === PART_KIND.TWO ? INSTRUCTION_KEYS.PART2_INTRO : INSTRUCTION_KEYS.PART3_INTRO
      } else if (currentContext.part === PART_KIND.ONE && prevContext.part === PART_KIND.ONE) {
        if (currentContext.forecastTopicId !== prevContext.forecastTopicId) {
          playTransitionKey = INSTRUCTION_KEYS.NEW_TOPIC
        }
      }
    }

    let transitionAudioUrl = null
    if (playTransitionKey) {
      const text = INSTRUCTION_SCRIPTS[playTransitionKey]
      const transitionAudio = await this.generatedAudioService.getOrCreate({
        text,
        voiceId: speakingSession.voiceId.toString()
      })
      transitionAudioUrl = transitionAudio.audioUrl
    }

    const questionAudio = await this.generatedAudioService.getOrCreate({
      text: questionDetails.content,
      voiceId: speakingSession.voiceId.toString()
    })

    return {
      isFinished: false,
      instruction: transitionAudioUrl,
      mode: speakingSession.type,
      questionIndex: index,
      totalQuestions: flatQuestions.length,
      question: {
        id: currentContext.id,
        questionId: questionDetails.questionId,
        part: currentContext.part,
        content: questionDetails.content,
        bulletPoints: questionDetails.bulletPoints || undefined,
        audioUrl: questionAudio.audioUrl
      }
    }
  }

  public async updateOne(filter: any, updateData: any, options?: { session?: any; [key: string]: any }) {
    return this.speakingSessionRepository.updateOne(filter, updateData, options)
  }

  public getSessionTotalQuestions(questions: any): number {
    let count = 0
    if (questions.part1) {
      count += questions.part1.reduce((sum: number, topic: any) => sum + (topic.forecastQuestionIds?.length || 0), 0)
    }
    if (questions.part2) {
      count += 1
    }
    if (questions.part3) {
      count += questions.part3.length || 0
    }
    return count
  }

  public async refreshSessionStatus(sessionId: string) {
    const session = await this.speakingSessionRepository.findById(sessionId)
    if (!session) return

    const attempts = await this.attemptService.findBySpeakingSessionId(sessionId)
    const totalQuestions = this.getSessionTotalQuestions(session.questions)

    if (attempts.length < totalQuestions) return

    const hasFailed = attempts.some((a) => a.status === ATTEMPT_STATUS.FAILED)
    if (hasFailed) {
      if (session.status !== SESSION_STATUS.FAILED) {
        await this.speakingSessionRepository.updateById(sessionId, { status: SESSION_STATUS.FAILED })
      }
      return
    }

    const allDone = attempts.every((a) => a.status === ATTEMPT_STATUS.DONE)
    if (allDone) {
      if (session.status !== SESSION_STATUS.COMPLETED && !session.scoringQueuedAt) {
        const updated = await this.speakingSessionRepository.updateOne(
          { _id: sessionId, scoringQueuedAt: null },
          { $set: { scoringQueuedAt: new Date() } }
        )
        if (updated) {
          await this.speakingProducer.scoreSession({ speakingSessionId: sessionId })
        }
      }
      return
    }

    if (session.status !== SESSION_STATUS.PROCESSING) {
      await this.speakingSessionRepository.updateById(sessionId, { status: SESSION_STATUS.PROCESSING })
    }
  }

  public async checkAndRefund(sessionId: string): Promise<void> {
    const session = await this.speakingSessionRepository.findById(sessionId)
    if (!session) return

    if (session.status === SESSION_STATUS.FAILED && session.retryCount >= MAX_RETRY && !session.refundedAt) {
      await this.refundSession(session)
    }
  }

  private async refundSession(session: SpeakingSessionType) {
    const pointsToRefund = calculateCreditCost(session.type)

    await this.speakingSessionRepository.withTransaction(async (dbSession) => {
      const updated = await this.speakingSessionRepository.updateOne(
        { _id: session._id, refundedAt: null },
        { $set: { refundedAt: new Date() } },
        { session: dbSession }
      )

      if (!updated) {
        return
      }

      const account = await this.accountService.addBalance(session.userId.toString(), pointsToRefund, dbSession)

      await this.creditLogService.create(
        {
          userId: session.userId.toString(),
          amount: pointsToRefund,
          reason: `Hoàn tiền thi thử (lỗi hệ thống)`,
          refType: CREDIT_LOG_REF_TYPE.REFUND,
          refId: session._id,
          balanceBefore: account.balance - pointsToRefund,
          balanceAfter: account.balance
        },
        dbSession
      )
    })
  }

  public async retrySession(userId: string, speakingSessionId: string) {
    const session = await this.speakingSessionRepository.findById(speakingSessionId)
    if (!session) throw new AppError('Speaking session not found', StatusCodes.NOT_FOUND)

    if (session.userId.toString() !== userId) {
      throw new AppError('You do not own this session', StatusCodes.FORBIDDEN)
    }

    if (session.status !== SESSION_STATUS.FAILED) {
      throw new AppError('Only failed sessions can be retried', StatusCodes.BAD_REQUEST)
    }

    if (session.refundedAt) {
      throw new AppError('Cannot retry a refunded session', StatusCodes.BAD_REQUEST)
    }

    const attempts = await this.attemptService.findBySpeakingSessionId(speakingSessionId)
    const failedAttempts = attempts.filter((a) => a.status === ATTEMPT_STATUS.FAILED)

    if (failedAttempts.length === 0) {
      throw new AppError('No failed attempts found in this session', StatusCodes.BAD_REQUEST)
    }

    await this.speakingSessionRepository.updateById(speakingSessionId, {
      status: SESSION_STATUS.PROCESSING,
      $inc: { retryCount: 1 },
      finishedAt: null,
      scoringQueuedAt: null
    })

    for (const attempt of failedAttempts) {
      await this.attemptService.retryAttempt(attempt)
    }

    return { success: true }
  }
}
