import jwt from 'jsonwebtoken'

export const TOKEN_TYPE = {
  ACCESS: 1,
  REFRESH: 2
} as const

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE]

export interface TokenPayload extends jwt.JwtPayload {
  _id: string
  email: string
  permissions: string[]
  type: TokenType
  sid?: string
  jti?: string
}
