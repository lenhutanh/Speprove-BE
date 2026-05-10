import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ISpeakingSessionRepository } from './speaking-session.repository.interface'
import { CreateSpeakingSessionBodyType, SpeakingSessionQueryType } from './speaking-session.type'
import { calculateCreditCost, toObjectId } from '~/common/utils'
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
import {
  CREDIT_LOG_REF_TYPE,
  PART_KIND,
  SPEAKING_SESSION_TYPE,
  INSTRUCTION_KEYS,
  InstructionKey
} from '~/common/constants/constants'
import { AttemptService } from '../attempt/attempt.service'
import { InstructionAudioService } from '../instruction-audio/instruction-audio.service'

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
    private readonly instructionAudioService: InstructionAudioService
  ) {}

  public async createNew(userId: string, data: CreateSpeakingSessionBodyType) {
    const [voice, activeForecast, recentSpeakingSessions] = await Promise.all([
      data.voiceId ? this.voiceService.findById(data.voiceId) : this.voiceService.getRandomVoice(),
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
        status: { $in: [0, 1] }
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

    if (speakingSession.status === 2) {
      const wellDoneAudioUrl = await this.instructionAudioService.getUrlByVoiceIdAndKey(
        speakingSession.voiceId.toString(),
        INSTRUCTION_KEYS.WELL_DONE
      )
      return {
        isFinished: true,
        instruction: wellDoneAudioUrl,
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
      const wellDoneAudioUrl = await this.instructionAudioService.getUrlByVoiceIdAndKey(
        speakingSession.voiceId.toString(),
        INSTRUCTION_KEYS.WELL_DONE
      )
      return {
        isFinished: true,
        instruction: wellDoneAudioUrl,
        question: null
      }
    }

    const currentContext = flatQuestions[index]

    const questionDetails = await this.forecastQuestionService.getDetails(
      currentContext.id,
      speakingSession.voiceId.toString()
    )

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
      transitionAudioUrl = await this.instructionAudioService.getUrlByVoiceIdAndKey(
        speakingSession.voiceId.toString(),
        playTransitionKey
      )
    }

    return {
      isFinished: false,
      instruction: transitionAudioUrl,
      mode: speakingSession.type,
      questionIndex: index,
      totalQuestions: flatQuestions.length,
      question: {
        id: currentContext.id,
        part: currentContext.part,
        content: questionDetails.content,
        audioUrl: questionDetails.audioUrl,
        bulletPoints: questionDetails.bulletPoints || undefined
      }
    }
  }

  public async updateOne(filter: any, updateData: any, options?: { session?: any; [key: string]: any }) {
    return this.speakingSessionRepository.updateOne(filter, updateData, options)
  }
}
