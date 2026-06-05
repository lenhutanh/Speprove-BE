import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/common/config/env.config'
import { ErrorCodes } from '../constants/error-codes'
import { ResponseTransformer } from '../http'
import { ZodError } from 'zod'
import { AppError } from '../errors'

export const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return ResponseTransformer.error(res, err.message, err.statusCode, err.errorCode, err.errors)
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.issues.reduce((acc: any, cur: any) => {
      const isReqObject = ['body', 'query', 'params'].includes(String(cur.path[0]))
      const cleanPath = isReqObject ? cur.path.slice(1).join('.') : cur.path.join('.')

      acc[cleanPath] = cur.message
      return acc
    }, {})

    return ResponseTransformer.error(
      res,
      'Validation failed',
      StatusCodes.UNPROCESSABLE_ENTITY,
      ErrorCodes.VALIDATION_ERROR,
      fieldErrors
    )
  }

  if (err.name === 'ValidationError') {
    const fieldErrors = Object.values(err.errors).reduce((acc: any, error: any) => {
      acc[error.path] = error.message
      return acc
    }, {})

    return ResponseTransformer.error(
      res,
      'Validation failed',
      StatusCodes.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
      fieldErrors
    )
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    const value = err.keyValue[field]

    return ResponseTransformer.error(
      res,
      `${field} '${value}' already exists`,
      StatusCodes.CONFLICT,
      ErrorCodes.DUPLICATE_ENTRY
    )
  }

  // if (err.name === 'JsonWebTokenError') {
  //   return ResponseTransformer.error(res, 'Invalid token', StatusCodes.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN)
  // }

  // if (err.name === 'TokenExpiredError') {
  //   return ResponseTransformer.error(res, 'Token expired', StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED)
  // }

  if (env.NODE_ENV === 'development') {
    console.error('Unexpected Error:', err)
  }

  return ResponseTransformer.error(
    res,
    'Internal Server Error',
    StatusCodes.INTERNAL_SERVER_ERROR,
    ErrorCodes.INTERNAL_SERVER_ERROR,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  )
}
