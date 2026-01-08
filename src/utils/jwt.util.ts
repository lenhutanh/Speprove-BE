import jwt from 'jsonwebtoken'
import { ApiError } from './api-error'
import { StatusCodes } from 'http-status-codes'

export const generateToken = (payload: object, secretSignature: string, tokenLife: string) => {
  try {
    return jwt.sign(payload, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife as any
    })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error generating token')
  }
}

export const verifyToken = (token: string, secretSignature: string) => {
  try {
    return jwt.verify(token, secretSignature)
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Invalid or expired token')
  }
}
