import jwt from 'jsonwebtoken'
import { TokenType } from '../constants/constants'

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string
  generateRefreshToken(payload: TokenPayload): string
  verifyAccessToken(token: string): TokenPayload
  verifyRefreshToken(token: string): TokenPayload
  hashToken(token: string): string
}

export interface TokenPayload extends jwt.JwtPayload {
  _id: string
  email: string
  permissions: string[]
  type: TokenType
  sid?: string
  jti?: string
}
