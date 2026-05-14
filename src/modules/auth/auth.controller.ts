import { Request, Response } from 'express'
import ms from 'ms'
import { env } from '~/common/config/env.config'
import { ResponseTransformer } from '~/common/utils'
import { injectable } from 'tsyringe'
import { AuthenticatedRequest } from '~/common/interfaces/request.interface'
import { AuthService } from './services'

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
}
