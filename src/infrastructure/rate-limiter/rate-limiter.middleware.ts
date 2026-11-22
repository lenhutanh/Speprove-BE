import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { container } from 'tsyringe'
import { AppError } from '~/common/errors'
import { RateLimiterService } from './rate-limiter.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { logger } from '~/infrastructure/logging/logger'

export const rateLimitMiddleware = (
  limit: number,
  windowMs: number,
  actionName: string,
  isStrict = false,
  message?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limiter = container.resolve(RateLimiterService)
      const identifier = (req.user as any)?.id || req.ip || 'anonymous'
      const key = `${actionName}:${identifier}`

      const { allowed, remaining, retryAfter } = isStrict
        ? await limiter.isAllowedStrict(key, limit, windowMs)
        : await limiter.isAllowedFast(key, limit, windowMs)

      res.setHeader('X-RateLimit-Limit', limit)
      res.setHeader('X-RateLimit-Remaining', remaining)

      if (retryAfter) {
        res.setHeader('Retry-After', retryAfter)
      }

      if (!allowed) {
        const errorMsg = message || 'Too many requests, please try again later.'
        return next(new AppError(errorMsg, StatusCodes.TOO_MANY_REQUESTS, ErrorCodes.TOO_MANY_REQUESTS))
      }

      next()
    } catch (err) {
      logger.error(`[RateLimit] Error on ${actionName}:`, err)
      next()
    }
  }
}
