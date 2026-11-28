import { singleton } from 'tsyringe'
import jwt from 'jsonwebtoken'
import { ITokenService } from '~/core/security/token.service.interface'
import { TOKEN_TYPE, TokenPayload } from '~/core/security/token-payload.type'
import { env } from '~/config/env.config'
import { StatusCodes } from 'http-status-codes'
import crypto from 'crypto'
import { ERROR_CODES } from '~/core/errors/error.constants'
import { AppError } from '~/core/errors/app.error'

@singleton()
export class TokenService implements ITokenService {
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
        throw new AppError('Invalid access token type', StatusCodes.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
      }
      return payload
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', StatusCodes.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED)
      }
      throw new AppError('Invalid access token', StatusCodes.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET_SIGNATURE) as TokenPayload
      if (payload.type !== TOKEN_TYPE.REFRESH) {
        throw new AppError('Invalid refresh token type', StatusCodes.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
      }
      return payload
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', StatusCodes.UNAUTHORIZED, ERROR_CODES.SESSION_EXPIRED)
      }
      throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
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
