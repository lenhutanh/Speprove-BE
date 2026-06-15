import { delay, inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IAttemptRepository } from './attempt.repository.interface'
import { IAttemptAnalysisRepository } from './attempt-analysis.repository.interface'
import { AttemptQueryType, CreateAttemptBodyType, GetTopAttemptQueryType, GetWordAudioQueryType } from './attempt.type'
import { SpeakingSessionService } from '../speaking-session/speaking-session.service'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ForecastQuestionService } from '../forecast-question/forecast-question.service'
import { FileService } from '../file/file.service'
import { toObjectId } from '~/common/utils'
import { AttemptMapper } from './attempt.mapper'
import { ANALYSIS_PROFILE, AnalysisProfile, ATTEMPT_STATUS } from './attempt.constants'
import { SESSION_STATUS, SPEAKING_SESSION_MODE } from '../speaking-session/speaking-session.constants'
import { CREDIT_LOG_REF_TYPE } from '../credit-log/credit-log.constants'
import { SpeakingProducer } from '~/infrastructure/queues/publishers/speaking.producer'
import { AudioFileType } from '../file/file.model'
import { ForecastQuestionResponseDto } from '../forecast-question/forecast-question.dto'
import { QueryBuilder } from '~/common/base'
import { AttemptType } from './attempt.model'
import { AccountService } from '../account/account.service'
import { CreditLogService } from '../credit-log/credit-log.service'
import { GeneratedAudioService } from '../generated-audio/generated-audio.service'
import { calculateCreditCost } from '../credit-log/credit.util'

@singleton()
export class AttemptService {
  constructor(
    @inject(TOKENS.IAttemptRepository)
    private readonly attemptRepository: IAttemptRepository,
    @inject(TOKENS.IAttemptAnalysisRepository)
    private readonly attemptAnalysisRepository: IAttemptAnalysisRepository,
    @inject(delay(() => SpeakingSessionService))
    private readonly speakingSessionService: SpeakingSessionService,
    private readonly forecastQuestionService: ForecastQuestionService,
    private readonly fileService: FileService,
    private readonly attemptMapper: AttemptMapper,
    private readonly speakingProducer: SpeakingProducer,
    private readonly accountService: AccountService,
    private readonly creditLogService: CreditLogService,
    private readonly generatedAudioService: GeneratedAudioService
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
    let order = 1

    if (data.mode === SPEAKING_SESSION_MODE.MOCK) {
      if (!data.speakingSessionId) {
        throw new AppError('Speaking session ID is required for mock mode', StatusCodes.BAD_REQUEST)
      }

      speakingSession = await this.speakingSessionService.findById(data.speakingSessionId)

      if (speakingSession.userId.toString() !== userId) {
        throw new AppError('You do not own this session', StatusCodes.FORBIDDEN)
      }

      if (speakingSession.status === SESSION_STATUS.COMPLETED) {
        throw new AppError('This speaking session is already finished', StatusCodes.BAD_REQUEST)
      }

      order = speakingSession.currentQuestionIndex
    }

    let attempt = null
    try {
      attempt = await this.attemptRepository.withTransaction(async (session) => {
        if (data.mode === SPEAKING_SESSION_MODE.PRACTICE) {
          const pointsToDeduct = calculateCreditCost(data.mode, forecastQuestion.part)
          const account = await this.accountService.deductBalance(userId, pointsToDeduct, session)
          await this.creditLogService.create(
            {
              userId: toObjectId(userId),
              amount: -pointsToDeduct,
              reason: `Luyện tập Part ${forecastQuestion.part}: ${forecastQuestion.content}`,
              refType: CREDIT_LOG_REF_TYPE.USAGE,
              refId: forecastQuestion.id,
              balanceBefore: account.balance + pointsToDeduct,
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
          order,
          status: ATTEMPT_STATUS.PENDING,
          analysisProfile: this._resolveAnalysisProfile(data.mode),
          analysisVersion: 'v1',
          transcriptPreview: undefined,
          scores: {},
          analysisMeta: {}
        }

        const newAttempt = await this.attemptRepository.create(attemptPayload, { session })

        if (data.mode === SPEAKING_SESSION_MODE.MOCK && speakingSession) {
          const totalQuestions = this.speakingSessionService.getSessionTotalQuestions(speakingSession.questions)
          const isLastQuestion = order === totalQuestions - 1

          const updateQuery: any = {
            $inc: { currentQuestionIndex: 1 }
          }
          if (isLastQuestion) {
            updateQuery.$set = {
              status: SESSION_STATUS.PROCESSING,
              finishedAt: new Date()
            }
          } else if (speakingSession.status === SESSION_STATUS.NOT_STARTED) {
            updateQuery.$set = { status: SESSION_STATUS.IN_PROGRESS }
          }

          await this.speakingSessionService.updateOne({ _id: speakingSession._id }, updateQuery, { session })
        }

        return newAttempt
      })
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('You have already submitted an answer for this question', StatusCodes.CONFLICT)
      }
      throw error
    }

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

  private _resolveAnalysisProfile(mode: string): AnalysisProfile {
    return mode === SPEAKING_SESSION_MODE.MOCK ? ANALYSIS_PROFILE.PREMIUM : ANALYSIS_PROFILE.STANDARD
  }

  public async getDetails(userId: string, attemptId: string) {
    const attempt = await this.attemptRepository.findById(attemptId, {
      populate: 'audioFileId'
    })
    if (!attempt) throw new AppError('Attempt not found', StatusCodes.NOT_FOUND)
    if (attempt.userId.toString() !== userId) throw new AppError('Forbidden', StatusCodes.FORBIDDEN)
    const analysis = await this.attemptAnalysisRepository.findOne(
      { attemptId: toObjectId(attemptId) },
      {
        select: [
          'transcription.scoringTranscript',
          'evaluation',
          'speechAnalysis.fluencyMetrics',
          'pronunciationAssessment.scores',
          'pronunciationAssessment.words.wordIndex',
          'pronunciationAssessment.words.word',
          'pronunciationAssessment.words.accuracyScore',
          'pronunciationAssessment.words.errorType',
          'pronunciationAssessment.words.offset',
          'pronunciationAssessment.words.duration',
          'pronunciationAssessment.words.punctuationAfter',
          'pronunciationAssessment.words.expectedIpa',
          'pronunciationAssessment.words.spokenIpa',
          'pronunciationAssessment.words.phonemes.phoneme',
          'pronunciationAssessment.words.phonemes.expectedIpa',
          'pronunciationAssessment.words.phonemes.spokenIpa',
          'pronunciationAssessment.words.phonemes.accuracyScore'
        ].join(' ')
      }
    )
    return this.attemptMapper.toDetailResponse(attempt, analysis)
  }

  public async getList(userId: string, queryOptions: AttemptQueryType) {
    const { limit, page, sortBy, sortOrder, forecastQuestionId, speakingSessionId } = queryOptions || {}

    const qb = new QueryBuilder<AttemptType>()

    const { filter, options } = qb
      .applyFilters({ userId, forecastQuestionId, speakingSessionId })
      .populate('audioFileId')
      .sort(sortBy, 'desc')
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
      .whereGte('scores.overall', data.band)
      .whereLt('scores.overall', data.band + 1)
      .sort('scores.overall', 'desc')
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

  public async countCompletedAttempts(speakingSessionId: string) {
    return await this.attemptRepository.count({ speakingSessionId })
  }

  public async findBySpeakingSessionId(speakingSessionId: string) {
    return await this.attemptRepository.findMany({ speakingSessionId })
  }

  public async getWordAudio(userId: string, attemptId: string, data: GetWordAudioQueryType) {
    const attempt = await this.attemptRepository.findById(attemptId)
    if (!attempt) throw new AppError('Attempt not found', StatusCodes.NOT_FOUND)
    if (attempt.userId.toString() !== userId) throw new AppError('Forbidden', StatusCodes.FORBIDDEN)

    const analysis = await this.attemptAnalysisRepository.findOne(
      { attemptId: toObjectId(attemptId) },
      {
        select: [
          'pronunciationAssessment.words.wordIndex',
          'pronunciationAssessment.words.word',
          'pronunciationAssessment.words.accuracyScore',
          'pronunciationAssessment.words.errorType',
          'pronunciationAssessment.words.expectedIpa',
          'pronunciationAssessment.words.spokenIpa'
        ].join(' ')
      }
    )

    const word = analysis?.pronunciationAssessment?.words?.find((item) => item.wordIndex === data.wordIndex)
    if (!word) throw new AppError('Word assessment not found', StatusCodes.NOT_FOUND)

    if (!this._shouldGenerateWordAudio(word)) {
      throw new AppError('This word does not need pronunciation audio', StatusCodes.BAD_REQUEST)
    }

    const text = word.word?.trim()
    if (!text) throw new AppError('Word text is empty', StatusCodes.BAD_REQUEST)

    const audio = await this.generatedAudioService.getOrCreate({ text, voiceId: data.voiceId })

    return { audioUrl: audio.audioUrl }
  }

  private _shouldGenerateWordAudio(word: any) {
    const hasErrorType = !!word.errorType && word.errorType !== 'None'
    const hasLowAccuracy = typeof word.accuracyScore === 'number' && word.accuracyScore < 80
    const hasIpaMismatch = !!word.expectedIpa && !!word.spokenIpa && word.expectedIpa.trim() !== word.spokenIpa.trim()

    return hasErrorType || hasLowAccuracy || hasIpaMismatch
  }

  public async retryAttempt(attempt: AttemptType) {
    const failedStage = attempt.analysisMeta?.failedStage || 'transcribe'

    await this.attemptRepository.updateById(attempt._id, {
      $set: {
        status: ATTEMPT_STATUS.PROCESSING,
        'analysisMeta.currentStage': failedStage
      },
      $unset: {
        'analysisMeta.error': 1,
        'analysisMeta.failedStage': 1,
        'analysisMeta.finishedAt': 1
      }
    })

    const questionDetails = await this.forecastQuestionService.getDetails(attempt.forecastQuestionId.toString())
    const audioFile = (await this.fileService.findById(attempt.audioFileId?.toString() || '')) as any
    const audioUrl = audioFile.aiAudioUrl ?? audioFile.url
    const questionContent = this._getQuestionContent(questionDetails)

    if (failedStage === 'transcribe') {
      await this.speakingProducer.transcribe({
        attemptId: attempt._id.toString(),
        audioUrl,
        questionContent,
        part: attempt.part
      })
    } else if (failedStage === 'assess') {
      const analysis = await this.attemptAnalysisRepository.findOne({ attemptId: attempt._id })
      const sttTranscript = analysis?.transcription?.sttTranscript || ''
      const normalizedReferenceText = analysis?.transcription?.normalizedReferenceText || sttTranscript

      await this.speakingProducer.assess({
        attemptId: attempt._id.toString(),
        transcript: normalizedReferenceText,
        referenceTranscript: sttTranscript,
        audioUrl,
        questionContent,
        part: attempt.part
      })
    } else if (failedStage === 'evaluate') {
      const analysis = await this.attemptAnalysisRepository.findOne({ attemptId: attempt._id })
      const scoringTranscript = analysis?.transcription?.scoringTranscript || ''
      const speechAnalysis = analysis?.speechAnalysis

      await this.speakingProducer.evaluate({
        attemptId: attempt._id.toString(),
        transcript: scoringTranscript,
        questionContent,
        speechAnalysis: speechAnalysis as any,
        part: attempt.part
      })
    }
  }
}
