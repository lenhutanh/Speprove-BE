import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { ITokenService } from '~/common/contracts/token-service.contract'
import { ISessionRepository } from './repositories/session.repository.interface'
import { Types } from 'mongoose'
import { env } from '~/common/config/env.config'
import { tokenLifeToMs } from '~/infrastructure/security/token-duration.util'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'

type RefreshSessionIdentifier = {
  sid: string
  refreshTokenId: string
}

type RefreshSessionMetadata = {
  ipAddress?: string
  deviceInfo?: string
}

@singleton()
export class SessionService {
  constructor(
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
    @inject(TOKENS.ISessionRepository) private readonly sessionRepository: ISessionRepository
  ) {}
  public async createOrUpdate(
    userId: string | Types.ObjectId,
    refreshToken: string,
    sessionIdentifier: RefreshSessionIdentifier,
    metadata?: RefreshSessionMetadata
  ) {
    const expiresAt = new Date(Date.now() + tokenLifeToMs(env.REFRESH_TOKEN_LIFE, 'REFRESH_TOKEN_LIFE'))
    const hashedToken = this.tokenService.hashToken(refreshToken)
    const session = await this.sessionRepository.upsertByUserId(userId, {
      sid: sessionIdentifier.sid,
      token: hashedToken,
      refreshTokenId: sessionIdentifier.refreshTokenId,
      expiresAt,
      lastUsedAt: new Date(),
      revokedAt: null,
      revokedReason: null,
      ipAddress: metadata?.ipAddress,
      deviceInfo: metadata?.deviceInfo
    })

    if (!session) {
      throw new AppError('Failed to create auth session', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    return session
  }

  public async rotateRefreshToken(
    userId: string | Types.ObjectId,
    currentRefreshToken: string,
    currentSessionIdentifier: Partial<RefreshSessionIdentifier>,
    nextRefreshToken: string,
    nextSessionIdentifier: RefreshSessionIdentifier,
    expiresAt: Date,
    metadata?: RefreshSessionMetadata
  ) {
    const currentHashedToken = this.tokenService.hashToken(currentRefreshToken)
    const nextHashedToken = this.tokenService.hashToken(nextRefreshToken)

    return await this.sessionRepository.rotateRefreshToken(
      userId,
      currentHashedToken,
      {
        sid: nextSessionIdentifier.sid,
        token: nextHashedToken,
        refreshTokenId: nextSessionIdentifier.refreshTokenId,
        expiresAt,
        lastUsedAt: new Date(),
        revokedAt: null,
        revokedReason: null,
        ipAddress: metadata?.ipAddress,
        deviceInfo: metadata?.deviceInfo
      },
      currentSessionIdentifier
    )
  }

  public async findByUserId(userId: string | Types.ObjectId) {
    return await this.sessionRepository.findOneByUserId(userId)
  }

  public async findByUserIdAndSid(userId: string | Types.ObjectId, sid: string) {
    return await this.sessionRepository.findOneByUserIdAndSid(userId, sid)
  }

  public async revokeByUserId(userId: string | Types.ObjectId, reason?: string) {
    return await this.sessionRepository.revokeByUserId(userId, reason)
  }

  public async revokeByUserIdAndSid(userId: string | Types.ObjectId, sid: string, reason?: string) {
    return await this.sessionRepository.revokeByUserIdAndSid(userId, sid, reason)
  }
}

