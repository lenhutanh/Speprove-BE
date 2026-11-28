import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/env.config'
import { ERROR_CODES } from '../errors/error.constants'
import { ResponseTransformer } from '../http/response-transformer.util'
import { ZodError } from 'zod'
import { AppError } from '../errors/app.error'
import { logger } from '~/core/logging/logger'

export const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) logger.error('Request failed', err)
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
      ERROR_CODES.VALIDATION_ERROR,
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
      ERROR_CODES.VALIDATION_ERROR,
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
      ERROR_CODES.DUPLICATE_ENTRY
    )
  }

  logger.error('Unexpected error', err)

  return ResponseTransformer.error(
    res,
    'Internal Server Error',
    StatusCodes.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  )
}
