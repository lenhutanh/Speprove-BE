import { Request, Response, NextFunction } from 'express'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import { env } from '~/config/env.config'
import mongoose from 'mongoose'
import { ZodError } from 'zod'

export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  let message = err.message || getReasonPhrase(statusCode)

  if (err instanceof ZodError) {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST
    message = `Invalid ID format for value: "${err.value}"`
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(', ')
  }

  if (err.code === 11000) {
    statusCode = StatusCodes.CONFLICT
    const field = Object.keys(err.keyValue)
    message = `Duplicate field value entered: ${field}. Please use another value.`
  }

  const responseError = {
    success: false,
    statusCode: statusCode,
    message: message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  }

  if (env.NODE_ENV === 'development') {
    console.error('Error Middleware:', responseError)
  }

  res.status(statusCode).json(responseError)
}
