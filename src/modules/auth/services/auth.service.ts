import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import { AccountService } from '../../account/account.service'
import { buildRedisKey, generateOtp, generateSecureToken } from '~/common/utils'
import { OtpService } from './otp.service'
import { registerOtpTemplate } from '~/resources/mail-templates'
import { LOGIN_PROVIDER, STATUS, TOKEN_TYPE } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { SessionService } from '../../session/session.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { ITokenService, TokenPayload } from '~/common/interfaces/token.interface'
import { TOKENS } from '~/common/constants/tokens'
import {
  ChangePasswordBodyType,
  GoogleCallbackType,
  LoginBodyType,
  RegisterBodyType,
  ResetPasswordBodyType,
  SetPasswordBodyType,
  UpdateProfileBodyType,
  VerifyBodyType
} from '../types/auth.type'
import { AppError } from '~/common/errors'
import { ICacheService } from '~/infrastructure/cache'
import { CACHE_CONFIG } from '../auth.constants'
import { MailProducer } from '~/infrastructure/queues/publishers/mail.producer'
import { UserInfoGoogleDto } from '../types/google.type'
import { GoogleService } from './google.service'
import { AccountProviderService } from '~/modules/account-provider/account-provider.service'
import { FileService } from '~/modules/file/file.service'

@singleton()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly mailProducer: MailProducer,
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
    @inject(TOKENS.ICacheService) private readonly cacheService: ICacheService,
    private readonly googleService: GoogleService,
    private readonly accountProviderService: AccountProviderService,
    private readonly fileService: FileService
  ) {}

  public async login(data: LoginBodyType, metadata: { ipAddress?: string; deviceInfo?: string }) {
    const loginError = new AppError(
      'Invalid email or password',
      StatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS
    )

    const account = await this.accountService.findByEmailForLogin(data.email)

    if (!account || !account.password) {
      throw loginError
    }

    const isMatch = await bcrypt.compare(data.password, account.password)

    if (!isMatch) {
      throw loginError
    }

    return this.issueAuthTokens(account, metadata)
  }

  public async register(data: RegisterBodyType) {
    const account = await this.accountService.findByEmail(data.email)

    if (account) {
      throw new AppError('Account already exists', StatusCodes.CONFLICT)
    }

    const otp = generateOtp()
    await this.otpService.storeOtp(data.email, otp)

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const tempData = { email: data.email, password: hashedPassword }

    await this.cacheService.set(buildRedisKey(CACHE_CONFIG.REGISTER, data.email), tempData, CACHE_CONFIG.REGISTER.TTL)

    const { subject, htmlContent } = registerOtpTemplate(otp)
    this.mailProducer.publishSendOtp({ to: data.email, subject, htmlContent })
  }

  public async verifyRegister(data: VerifyBodyType) {
    const existedAccount = await this.accountService.findByEmail(data.email)
    if (existedAccount) {
      throw new AppError('Your account is already verified!', StatusCodes.NOT_ACCEPTABLE)
    }

    const cacheKey = buildRedisKey(CACHE_CONFIG.REGISTER, data.email)
    const tempUserData = await this.cacheService.get(cacheKey)

    if (!tempUserData) {
      throw new AppError('Registration request expired or not found', StatusCodes.NOT_FOUND)
    }

    const isOtpValid = await this.otpService.verifyOtp(data.email, data.otp)
    if (!isOtpValid) {
      throw new AppError('OTP is invalid or has expired', StatusCodes.NOT_ACCEPTABLE)
    }

    try {
      await this.accountService.createUser(tempUserData)

      await Promise.all([this.cacheService.delete(cacheKey), this.otpService.deleteOtp(data.email)])
    } catch (error) {
      throw new AppError('Failed to create account, please try again later', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async refreshToken(token: string, metadata: { ipAddress?: string; deviceInfo?: string }) {
    if (!token) {
      throw new AppError('Refresh token not found', StatusCodes.UNAUTHORIZED, ErrorCodes.NOT_FOUND)
    }

    const decoded = this.tokenService.verifyRefreshToken(token) as TokenPayload

    const currentSession = await this.sessionService.findValid(decoded._id, token)
    if (!currentSession) {
      const existingOtherSession = await this.sessionService.findByUserId(decoded._id)

      if (existingOtherSession) {
        throw new AppError(
          'Your account has been logged in from another device.',
          StatusCodes.UNAUTHORIZED,
          ErrorCodes.SESSION_REPLACED
        )
      }

      throw new AppError(
        'Your session has expired. Please log in again.',
        StatusCodes.UNAUTHORIZED,
        ErrorCodes.SESSION_EXPIRED
      )
    }

    const account = await this.accountService.findByEmailForToken(decoded.email)

    if (!account) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND)
    }

    this.ensureAccountCanAuthenticate(account)

    const group = account.groupId as any
    const permissions = group?.permissionIds?.map((p: any) => p.pCode) || []

    const payload = {
      _id: account._id.toString(),
      email: account.email,
      permissions
    }

    const newRefreshToken = this.tokenService.generateRefreshToken({ ...payload, type: TOKEN_TYPE.REFRESH })

    await this.sessionService.createOrUpdate(account._id, newRefreshToken, metadata)

    return {
      accessToken: this.tokenService.generateAccessToken({ ...payload, type: TOKEN_TYPE.ACCESS }),
      refreshToken: newRefreshToken
    }
  }

  public async logout(userId: string): Promise<void> {
    if (!userId) return
    await this.sessionService.deleteByUserId(userId)
  }

  public async forgotPassword(data: { email: string }): Promise<void> {
    const account = await this.accountService.findByEmail(data.email)
    if (!account) throw new AppError('Account not found', StatusCodes.NOT_FOUND)

    const otp = generateOtp()
    await this.otpService.storeOtp(data.email, otp)

    const { subject, htmlContent } = registerOtpTemplate(otp)
    this.mailProducer.publishSendOtp({ to: data.email, subject, htmlContent })
  }

  public async verifyForgotPassword(data: VerifyBodyType) {
    const account = await this.accountService.findByEmail(data.email)

    if (!account) throw new AppError('Account not found', StatusCodes.NOT_FOUND)

    const isOtpValid = await this.otpService.verifyOtp(data.email, data.otp)
    if (!isOtpValid) {
      throw new AppError('OTP is invalid or has expired', StatusCodes.NOT_ACCEPTABLE)
    }

    await this.otpService.deleteOtp(data.email)

    const resetToken = generateSecureToken()
    const cacheKey = buildRedisKey(CACHE_CONFIG.RESET_PASSWORD_TOKEN, resetToken)
    await this.cacheService.set<string>(cacheKey, data.email, CACHE_CONFIG.RESET_PASSWORD_TOKEN.TTL)
    return { resetToken }
  }

  public async resetPassword(data: ResetPasswordBodyType) {
    const cacheKey = buildRedisKey(CACHE_CONFIG.RESET_PASSWORD_TOKEN, data.resetToken)
    const email = await this.cacheService.get<string>(cacheKey)
    if (!email) throw new AppError('Reset token is invalid or has expired', StatusCodes.BAD_REQUEST)

    const account = await this.accountService.findByEmail(email)
    if (!account) throw new AppError('Account not found', StatusCodes.NOT_FOUND)

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await this.accountService.updatePassword(email, hashedPassword)

    await this.cacheService.delete(cacheKey)
  }

  public async getGoogleLoginUrl() {
    const state = generateSecureToken()
    const cacheKey = buildRedisKey(CACHE_CONFIG.GOOGLE_OAUTH_STATE, state)
    await this.cacheService.set<string>(cacheKey, state, CACHE_CONFIG.GOOGLE_OAUTH_STATE.TTL)
    return this.googleService.generateAuthUrl(state)
  }

  public async handleGoogleCallback(data: GoogleCallbackType, metadata: { ipAddress?: string; deviceInfo?: string }) {
    const cacheKey = buildRedisKey(CACHE_CONFIG.GOOGLE_OAUTH_STATE, data.state)

    const storedState = await this.cacheService.get<string>(cacheKey)

    if (!storedState) {
      throw new AppError('Invalid Google OAuth state', StatusCodes.UNAUTHORIZED, ErrorCodes.OAUTH_STATE_INVALID)
    }

    await this.cacheService.delete(cacheKey)

    const userInfo = await this.googleService.getUserInfo(data.code)
    return await this.loginWithGoogle(userInfo, metadata)
  }

  public async loginWithGoogle(userInfo: UserInfoGoogleDto, metadata: { ipAddress?: string; deviceInfo?: string }) {
    if (!userInfo.emailVerified) {
      throw new AppError('Google email is not verified', StatusCodes.UNAUTHORIZED, ErrorCodes.GOOGLE_EMAIL_NOT_VERIFIED)
    }

    let account = null

    try {
      const provider = await this.accountProviderService.findByProvider(userInfo.providerId, LOGIN_PROVIDER.GOOGLE)

      if (provider) {
        account = await this.accountService.getById(provider.accountId.toString())
      } else {
        account = await this.accountService.withTransaction(async (session) => {
          const existedAccount = await this.accountService.findByEmail(userInfo.email)
          if (existedAccount) {
            this.ensureAccountCanAuthenticate(existedAccount)
          }
          const googleAccount = existedAccount || (await this.accountService.createUser(userInfo, session))

          await this.accountProviderService.create(
            {
              accountId: googleAccount._id,
              provider: LOGIN_PROVIDER.GOOGLE,
              providerId: userInfo.providerId,
              email: userInfo.email
            },
            session
          )

          return googleAccount
        })
      }
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) {
        throw error
      }

      account = await this.recoverGoogleLoginFromDuplicate(userInfo)
    }

    if (!account) {
      throw new AppError('Google account conflict', StatusCodes.CONFLICT, ErrorCodes.GOOGLE_ACCOUNT_CONFLICT)
    }

    account = await this.accountService.getById(account._id.toString())

    return this.issueAuthTokens(account, metadata)
  }

  private async recoverGoogleLoginFromDuplicate(userInfo: UserInfoGoogleDto) {
    const provider = await this.accountProviderService.findByProvider(userInfo.providerId, LOGIN_PROVIDER.GOOGLE)

    if (provider) {
      return await this.accountService.getById(provider.accountId.toString())
    }

    const account = await this.accountService.findByEmail(userInfo.email)
    if (!account) return null
    this.ensureAccountCanAuthenticate(account)

    try {
      await this.accountProviderService.create({
        accountId: account._id,
        provider: LOGIN_PROVIDER.GOOGLE,
        providerId: userInfo.providerId,
        email: userInfo.email
      })

      return account
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) {
        throw error
      }

      const recoveredProvider = await this.accountProviderService.findByProvider(
        userInfo.providerId,
        LOGIN_PROVIDER.GOOGLE
      )
      if (!recoveredProvider) return null

      return await this.accountService.getById(recoveredProvider.accountId.toString())
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000
  }

  public async changePassword(userId: string, data: ChangePasswordBodyType) {
    const account = await this.accountService.getById(userId)

    if (!account.password)
      throw new AppError('This account does not have a password. Please set a password first.', StatusCodes.BAD_REQUEST)

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, account.password)

    if (!isCurrentPasswordValid) throw new AppError('Current password is wrong', StatusCodes.BAD_REQUEST)

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await this.accountService.updatePassword(account.email, hashedPassword)
  }

  private async issueAuthTokens(account: any, metadata: { ipAddress?: string; deviceInfo?: string }) {
    this.ensureAccountCanAuthenticate(account)

    const group = account.groupId as any
    const permissions = group?.permissionIds?.map((p: any) => p.pCode) || []

    const payload = {
      _id: account._id.toString(),
      email: account.email,
      permissions
    }

    const refreshToken = this.tokenService.generateRefreshToken({
      ...payload,
      type: TOKEN_TYPE.REFRESH
    })

    await this.sessionService.createOrUpdate(account._id, refreshToken, metadata)

    return {
      accessToken: this.tokenService.generateAccessToken({
        ...payload,
        type: TOKEN_TYPE.ACCESS
      }),
      refreshToken
    }
  }

  private ensureAccountCanAuthenticate(account: { status: number }) {
    if (account.status === STATUS.PENDING) {
      throw new AppError(
        'Your account has not been verified. Please check your email.',
        StatusCodes.FORBIDDEN,
        ErrorCodes.ACCOUNT_NOT_VERIFIED
      )
    }

    if (account.status === STATUS.LOCKED || account.status === STATUS.DELETED) {
      throw new AppError('Your account is locked or deleted', StatusCodes.FORBIDDEN, ErrorCodes.ACCOUNT_LOCKED)
    }

    if (account.status !== STATUS.ACTIVE) {
      throw new AppError('Your account is not active', StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN)
    }
  }

  public async setPassword(userId: string, data: SetPasswordBodyType) {
    const account = await this.accountService.getById(userId)
    if (account.password) throw new AppError('Account already has password')

    const hashedPassword = await bcrypt.hash(data.password, 10)

    await this.accountService.updatePassword(account.email, hashedPassword)
  }

  public async updateProfile(userId: string, data: UpdateProfileBodyType) {
    await this.accountService.getById(userId)
    if (data.avatarId) {
      const avatarFile = await this.fileService.findById(data.avatarId)
      if (avatarFile.ownerId && avatarFile.ownerId.toString() !== userId) {
        throw new AppError('You do not own this file', StatusCodes.FORBIDDEN)
      }
    }
    return await this.accountService.updateProfile(userId, data)
  }
}
