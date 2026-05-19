import { Request, Response } from 'express'
import ms from 'ms'
import { env } from '~/common/config/env.config'
import { ResponseTransformer } from '~/common/utils'
import { injectable } from 'tsyringe'
import { AuthenticatedRequest } from '~/common/interfaces/request.interface'
import { AuthService } from './services'
import { AppError } from '~/common/errors'
import { ErrorCodes } from '~/common/constants/error-codes'

@injectable()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async login(req: Request, res: Response) {
    const metadata = {
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    }
    const result = await this.authService.login(req.validated.body, metadata)
    this.setAuthCookies(res, result)
    return ResponseTransformer.success(res, result, 'Login successfully.')
  }

  public async register(req: Request, res: Response) {
    await this.authService.register(req.validated.body)
    return ResponseTransformer.successNoData(res, 'OTP sent to your email.')
  }

  public async verifyRegister(req: Request, res: Response) {
    await this.authService.verifyRegister(req.validated.body)
    return ResponseTransformer.successNoData(res, 'Create account successfully.')
  }

  public async logout(req: AuthenticatedRequest, res: Response) {
    await this.authService.logout(req.user._id)
    this.clearAuthCookies(res)
    return ResponseTransformer.successNoData(res, 'Logout successfully.')
  }

  public async refreshToken(req: Request, res: Response) {
    const metadata = {
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    }
    const result = await this.authService.refreshToken(req.cookies?.refreshToken, metadata)
    this.setAuthCookies(res, result)
    return ResponseTransformer.success(res, result, 'Refresh token successfully')
  }

  public async forgotPassword(req: Request, res: Response) {
    await this.authService.forgotPassword(req.validated.body)
    return ResponseTransformer.successNoData(res, 'OTP sent to your email.')
  }

  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
    const isProduction = env.NODE_ENV === 'production'
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ms('1h')
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ms('14 days'),
      path: '/api/v1/auth'
    })
  }

  private clearAuthCookies(res: Response): void {
    const isProduction = env.NODE_ENV === 'production'

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/v1/auth'
    })
  }

  public async verifyForgotPassword(req: Request, res: Response) {
    const result = await this.authService.verifyForgotPassword(req.validated.body)
    return ResponseTransformer.success(res, result, 'Verify forgot password successfully')
  }

  public async resetPassword(req: Request, res: Response) {
    await this.authService.resetPassword(req.validated.body)
    return ResponseTransformer.successNoData(res, 'Reset password successfully')
  }

  public async googleLogin(_req: Request, res: Response) {
    const { url } = await this.authService.getGoogleLoginUrl()
    res.redirect(url)
  }

  public async googleCallback(req: Request, res: Response) {
    try {
      const metadata = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      }

      const result = await this.authService.handleGoogleCallback(req.validated.query, metadata)

      this.setAuthCookies(res, result)

      return res.redirect(`${env.APP_URL}/auth/callback`)
    } catch (error) {
      const errorCode = error instanceof AppError ? error.errorCode : ErrorCodes.INTERNAL_SERVER_ERROR

      const params = new URLSearchParams({
        errorCode
      })

      return res.redirect(`${env.APP_URL}/auth/callback?${params.toString()}`)
    }
  }

  public async changePassword(req: AuthenticatedRequest, res: Response) {
    await this.authService.changePassword(req.user._id, req.validated.body)
    return ResponseTransformer.successNoData(res, 'Change password successfully')
  }

  public async setPassword(req: AuthenticatedRequest, res: Response) {
    await this.authService.setPassword(req.user._id, req.validated.body)
    return ResponseTransformer.successNoData(res, 'Set password successfully')
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response) {
    const result = await this.authService.updateProfile(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, result, 'Update profile successfully')
  }
}
