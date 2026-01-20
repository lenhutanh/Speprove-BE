import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/env.config'
import { ApiError } from '~/utils/api-error'
import { verifyToken } from '~/utils'

const isAuthorized = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const clientAccessToken =
    req?.cookies?.accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)

  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
  }

  try {
    req.jwtDecoded = verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

const isAuthorizedOptional = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const clientAccessToken =
    req?.cookies?.accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)

  if (clientAccessToken) {
    try {
      req.jwtDecoded = verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    } catch (error) {
      console.log('Optional Auth: Invalid token, proceeding as guest')
    }
  }
  next()
}

const hasPermission = (requiredPermissions: string | string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userPermissions = req.jwtDecoded?.permissions || []
      const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

      const hasAll = required.every((p) => userPermissions.includes(p))

      if (!hasAll) {
        return next(new ApiError(StatusCodes.FORBIDDEN, 'Permission denied!'))
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const authMiddleware = { isAuthorized, hasPermission, isAuthorizedOptional }
