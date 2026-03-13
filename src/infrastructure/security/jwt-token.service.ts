import { singleton } from 'tsyringe'
import jwt from 'jsonwebtoken'
import { ITokenService, TokenPayload } from '~/common/interfaces/token.interface'
import { env } from '~/common/config/env.config'
import { TOKEN_TYPE } from '~/common/constants/constants'
import { StatusCodes } from 'http-status-codes'
import crypto from 'crypto'
import { ErrorCodes } from '~/common/constants/error-codes'
import { AppError } from '~/common/errors'

@singleton()
export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload, type: TOKEN_TYPE.ACCESS }, env.ACCESS_TOKEN_SECRET_SIGNATURE, {
      expiresIn: env.ACCESS_TOKEN_LIFE
    })
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload, type: TOKEN_TYPE.REFRESH }, env.REFRESH_TOKEN_SECRET_SIGNATURE, {
      expiresIn: env.REFRESH_TOKEN_LIFE
    })
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET_SIGNATURE) as TokenPayload
      if (payload.type !== TOKEN_TYPE.ACCESS) {
        throw new AppError('Invalid access token type', StatusCodes.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN)
      }
      return payload
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED)
      }
      throw new AppError('Invalid access token', StatusCodes.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN)
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET_SIGNATURE) as TokenPayload
      if (payload.type !== TOKEN_TYPE.REFRESH) {
        throw new AppError('Invalid refresh token type', StatusCodes.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN)
      }
      return payload
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', StatusCodes.UNAUTHORIZED, ErrorCodes.SESSION_EXPIRED)
      }
      throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN)
    }
  }

  hashToken(token: string): string {
    try {
      return crypto.createHash('sha256').update(token).digest('hex')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error hashing token'
      throw new AppError(`Token hashing failed: ${message}`, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
