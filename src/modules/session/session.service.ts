import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ITokenService } from '~/common/interfaces/token.interface'
import { ISessionRepository } from './repositories/session.repository.interface'
import { Types } from 'mongoose'

@singleton()
export class SessionService {
  constructor(
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
    @inject(TOKENS.ISessionRepository) private readonly sessionRepository: ISessionRepository
  ) {}
  public async createOrUpdate(
    userId: string | Types.ObjectId,
    refreshToken: string,
    metadata?: { ipAddress?: string; deviceInfo?: string }
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const hashedToken = this.tokenService.hashToken(refreshToken)
    return await this.sessionRepository.upsertByUserId(userId, {
      token: hashedToken,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      deviceInfo: metadata?.deviceInfo
    })
  }

  public async findValid(userId: string | Types.ObjectId, refreshToken: string) {
    const hashedToken = this.tokenService.hashToken(refreshToken)
    return await this.sessionRepository.findValidSession(userId, hashedToken)
  }

  public async findByUserId(userId: string | Types.ObjectId) {
    return await this.sessionRepository.findOneByUserId(userId)
  }

  public async deleteByUserId(userId: string | Types.ObjectId) {
    return await this.sessionRepository.deleteByUserId(userId)
  }
}
