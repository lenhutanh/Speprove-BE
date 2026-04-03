import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ISpeakingSessionRepository } from './speaking-session.repository.interface'
import { CreateSpeakingSessionBodyType } from './speaking-session.type'
import { toObjectId } from '~/common/utils'
import { SpeakingSessionMapper } from './speaking-session.mapper'
import { ForecastService } from '../forecast/forecast.service'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'

@singleton()
export class SpeakingSessionService {
  constructor(
    @inject(TOKENS.ISpeakingSessionRepository) private readonly speakingSessionRepository: ISpeakingSessionRepository,
    private readonly speakingSessionMapper: SpeakingSessionMapper,
    private readonly forecastService: ForecastService
  ) {}

  public async createNew(userId: string, data: CreateSpeakingSessionBodyType) {
    const exists = await this.forecastService.existsById(data.forecastId)
    if (!exists) throw new AppError('Forecast not found', StatusCodes.NOT_FOUND)
    const createData = {
      ...data,
      userId: toObjectId(userId),
      forecastId: toObjectId(data.forecastId)
    }
    const speakingSession = await this.speakingSessionRepository.create(createData)
    return this.speakingSessionMapper.toResponse(speakingSession)
  }

  public async findById(id: string) {
    const session = await this.speakingSessionRepository.findById(id)
    if (!session) throw new AppError('Speaking session not found', StatusCodes.NOT_FOUND)
    return session
  }
}
