import { TokenPayload } from '../types/token-payload.type'

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string
  generateRefreshToken(payload: TokenPayload): string
  verifyAccessToken(token: string): TokenPayload
  verifyRefreshToken(token: string): TokenPayload
  hashToken(token: string): string
}
