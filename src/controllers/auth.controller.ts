import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { ApiResponse } from '~/dtos/api-response.dto'
import { env } from '~/config/env.config'
import { authService } from '~/services/auth.service'
import { ApiError } from '~/utils/api-error'

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.validated.body)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ms('1h')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ms('14 days'),
      path: '/api/v1/auth'
    })

    res.status(StatusCodes.OK).json(new ApiResponse('Login successfully', result))
  } catch (error) {
    next(error)
  }
}

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.register(req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Registered successfully!'))
  } catch (error) {
    next(error)
  }
}

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.verify(req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Verified successfully!'))
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found')
    }
    const result = await authService.refreshToken(token)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ms('1h')
    })

    res.status(StatusCodes.OK).json(new ApiResponse('Refreshed token successfully!', result))
  } catch (error) {
    next(error)
  }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json(new ApiResponse('Logout successfully!'))
  } catch (error) {
    next(error)
  }
}

export const authController = {
  login,
  register,
  verify,
  refreshToken,
  logout
}
