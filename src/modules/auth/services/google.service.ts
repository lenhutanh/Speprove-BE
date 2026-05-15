import { singleton } from 'tsyringe'
import { env } from '~/common/config'
import { UserInfoGoogleDto } from '../types/google.type'
import { OAuth2Client } from 'google-auth-library'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ErrorCodes } from '~/common/constants/error-codes'

@singleton()
export class GoogleService {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectUri: string
  private readonly oauth2Client: OAuth2Client

  constructor() {
    this.clientId = env.GOOGLE_CLIENT_ID
    this.clientSecret = env.GOOGLE_CLIENT_SECRET
    this.redirectUri = env.GOOGLE_REDIRECT_URI
    this.oauth2Client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri)
  }

  public generateAuthUrl(state: string): { url: string } {
    const url = this.oauth2Client.generateAuthUrl({
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state
    })

    return { url }
  }

  public async getUserInfo(code: string): Promise<UserInfoGoogleDto> {
    const { tokens } = await this.oauth2Client.getToken(code)
    if (!tokens.id_token) {
      throw new AppError('Missing Google id_token', StatusCodes.UNAUTHORIZED, ErrorCodes.GOOGLE_TOKEN_INVALID)
    }
    return await this.verifyIdToken(tokens.id_token)
  }

  private async verifyIdToken(idToken: string): Promise<UserInfoGoogleDto> {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken,
      audience: this.clientId
    })

    const payload = ticket.getPayload()

    if (!payload) {
      throw new AppError('Invalid Google token payload', StatusCodes.UNAUTHORIZED, ErrorCodes.GOOGLE_TOKEN_INVALID)
    }

    if (!payload.email) {
      throw new AppError(
        'Google account does not have email',
        StatusCodes.UNAUTHORIZED,
        ErrorCodes.GOOGLE_TOKEN_INVALID
      )
    }

    return {
      providerId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      emailVerified: payload.email_verified ?? false
    }
  }
}
