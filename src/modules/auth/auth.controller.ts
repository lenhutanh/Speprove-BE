import { Request, Response } from 'express'
import { env } from '~/common/config/env.config'
import { ResponseTransformer } from '~/common/http'
import { injectable } from 'tsyringe'
import { AuthenticatedRequest } from '~/common/types/request.type'
import { AuthService } from './services'
import { AppError } from '~/common/errors'
import { ErrorCodes } from '~/common/constants/error-codes'
import { tokenLifeToMs } from '~/infrastructure/security/token-duration.util'

type AuthClientType = 'web' | 'mobile'
type AuthTokens = { accessToken: string; refreshToken: string; refreshTokenExpiresAt: Date }

@injectable()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async login(req: Request, res: Response) {
    const metadata = {
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    }
    const result = await this.authService.login(req.validated.body, metadata)
    return this.respondWithAuthTokens(req, res, result, 'Login successfully.')
  }

  public async register(req: Request, res: Response) {
    await this.authService.register(req.validated.body)
    return ResponseTransformer.successNoData(res, 'OTP sent to your email.')
  }

  public async verifyRegister(req: Request, res: Response) {
    await this.authService.verifyRegister(req.validated.body)
    return ResponseTransformer.successNoData(res, 'Create account successfully.')
  }

  public async logout(req: Request, res: Response) {
    await this.authService.logout(req.user?._id, req.user?.sid, this.getClientRefreshToken(req))

    if (this.getClientType(req) === 'web') {
      this.clearAuthCookies(res)
    }

    return ResponseTransformer.successNoData(res, 'Logout successfully.')
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      const metadata = {
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      }
      const result = await this.authService.refreshToken(this.getClientRefreshToken(req), metadata)
      return this.respondWithAuthTokens(req, res, result, 'Refresh token successfully')
    } catch (error) {
      if (this.getClientType(req) === 'web') {
        this.clearAuthCookies(res)
      }

      throw error
    }
  }

  public async forgotPassword(req: Request, res: Response) {
    await this.authService.forgotPassword(req.validated.body)
    return ResponseTransformer.successNoData(res, 'OTP sent to your email.')
  }

  private respondWithAuthTokens(req: Request, res: Response, tokens: AuthTokens, message: string) {
    if (this.getClientType(req) === 'mobile') {
      return ResponseTransformer.success(res, tokens, message)
    }

    this.setAuthCookies(res, tokens)
    return ResponseTransformer.successNoData(res, message)
  }

  private getClientType(req: Request): AuthClientType {
    return req.headers['x-client-type'] === 'mobile' ? 'mobile' : 'web'
  }

  private getClientRefreshToken(req: Request): string | undefined {
    if (this.getClientType(req) === 'mobile') {
      return req.body?.refreshToken
    }

    return req.cookies?.refreshToken
  }

  private setAuthCookies(res: Response, tokens: AuthTokens): void {
    const isProduction = env.NODE_ENV === 'production'
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: tokenLifeToMs(env.ACCESS_TOKEN_LIFE, 'ACCESS_TOKEN_LIFE')
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: Math.max(0, new Date(tokens.refreshTokenExpiresAt).getTime() - Date.now()),
      path: '/api/v1/auth'
    })
  }

  private clearAuthCookies(res: Response): void {
    const isProduction = env.NODE_ENV === 'production'

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/api/v1/auth'
    })
  }

  public async verifyForgotPassword(req: Request, res: Response) {
    const result = await this.authService.verifyForgotPassword(req.validated.body)
    return ResponseTransformer.success(res, result, 'Verify forgot password successfully')
  }

  public async resetPassword(req: Request, res: Response) {
    await this.authService.resetPassword(req.validated.body)
    this.clearAuthCookies(res)
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
    this.clearAuthCookies(res)
    return ResponseTransformer.successNoData(res, 'Change password successfully')
  }

  public async setPassword(req: AuthenticatedRequest, res: Response) {
    await this.authService.setPassword(req.user._id, req.validated.body)
    return ResponseTransformer.successNoData(res, 'Set password successfully')
  }
}
