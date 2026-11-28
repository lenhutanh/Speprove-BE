import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ITokenService } from '../security/token.service.interface'
import { TOKENS } from '../di/di.constants'
import { container, inject, singleton } from 'tsyringe'
import { ERROR_CODES } from '../errors/error.constants'
import { AppError } from '../errors/app.error'
import { logger } from '~/core/logging/logger'

@singleton()
export class AuthMiddleware {
  constructor(@inject(TOKENS.ITokenService) private readonly tokenService: ITokenService) {}

  isAuthorized = async (req: Request, _res: Response, next: NextFunction) => {
    const clientAccessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]
    if (!clientAccessToken) {
      return next(new AppError('Token not found', StatusCodes.UNAUTHORIZED, ERROR_CODES.TOKEN_MISSING))
    }
    try {
      req.user = this.tokenService.verifyAccessToken(clientAccessToken)
      next()
    } catch (error) {
      next(error)
    }
  }

  isAuthorizedOptional = async (req: Request, _res: Response, next: NextFunction) => {
    const clientAccessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]
    if (clientAccessToken) {
      try {
        req.user = this.tokenService.verifyAccessToken(clientAccessToken)
      } catch (error) {
        logger.debug('Optional Auth: Invalid token, proceeding as guest')
      }
    }
    next()
  }

  hasPermission = (requiredPermissions: string | string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        const userPermissions = req.user?.permissions || []
        const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

        const hasAll = required.every((p) => {
          const [resource, action, scope] = p.split(':')

          return userPermissions.some((up) => {
            const [uResource, uAction, uScope] = up.split(':')

            if (uResource !== resource || uAction !== action) return false

            if (scope) {
              return uScope === scope || uScope === 'ALL'
            }
            return true
          })
        })

        if (!hasAll) {
          return next(new AppError('Permission denied', StatusCodes.FORBIDDEN))
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }
}

/** Resolves AuthMiddleware per request, so route files do not need the DI container at import time. */
export const authMiddleware = {
  isAuthorized: (req: Request, res: Response, next: NextFunction) =>
    container.resolve(AuthMiddleware).isAuthorized(req, res, next),
  isAuthorizedOptional: (req: Request, res: Response, next: NextFunction) =>
    container.resolve(AuthMiddleware).isAuthorizedOptional(req, res, next),
  hasPermission: (requiredPermissions: string | string[]) => (req: Request, res: Response, next: NextFunction) =>
    container.resolve(AuthMiddleware).hasPermission(requiredPermissions)(req, res, next)
}
