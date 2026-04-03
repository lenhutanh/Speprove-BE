import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import { AccountService } from '../../account/account.service'
import { buildRedisKey, generateOtp } from '~/common/utils'
import { OtpService } from './otp.service'
import { registerOtpTemplate } from '~/resources/mail-templates'
import { STATUS, TOKEN_TYPE } from '~/common/constants/constants'
import { inject, singleton } from 'tsyringe'
import { SessionService } from '../../session/session.service'
import { ErrorCodes } from '~/common/constants/error-codes'
import { ITokenService, TokenPayload } from '~/common/interfaces/token.interface'
import { TOKENS } from '~/common/constants/tokens'
import { LoginBodyType, RegisterBodyType, VerifyBodyType } from '../types/auth.type'
import { AppError } from '~/common/errors'
import { ICacheService } from '~/infrastructure/cache'
import { CACHE_CONFIG } from '../auth.constants'
import { MailProducer } from '~/infrastructure/queues/publishers/mail.producer'

@singleton()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly mailProducer: MailProducer,
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
    @inject(TOKENS.ICacheService) private readonly cacheService: ICacheService
  ) {}

  public async login(data: LoginBodyType, metadata: { ipAddress?: string; deviceInfo?: string }) {
    const account = await this.accountService.findByEmail(data.email)

    const loginError = new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED)

    if (!account) throw loginError

    if (account.status === STATUS.PENDING) {
      throw new AppError('Your account has not been verified. Please check your email.', StatusCodes.FORBIDDEN)
    }

    const isMatch = account.password ? await bcrypt.compare(data.password, account.password) : false
    if (!isMatch) throw loginError

    const group = account.groupId as any
    const permissions = group?.permissionIds?.map((p: any) => p.pCode) || []

    const payload = {
      _id: account._id.toString(),
      email: account.email,
      permissions
    }

    const refreshToken = this.tokenService.generateRefreshToken({ ...payload, type: TOKEN_TYPE.REFRESH })

    await this.sessionService.createOrUpdate(account._id, refreshToken, metadata)

    return {
      accessToken: this.tokenService.generateAccessToken({ ...payload, type: TOKEN_TYPE.ACCESS }),
      refreshToken
    }
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

  public async verify(data: VerifyBodyType) {
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
      throw new AppError('OTP does not match or expired', StatusCodes.NOT_ACCEPTABLE)
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

    const account = await this.accountService.findByEmail(decoded.email)

    if (!account) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND)
    }

    if (account.status === STATUS.LOCKED || account.status === STATUS.DELETED) {
      throw new AppError('Your account is locked or deleted', StatusCodes.FORBIDDEN)
    }

    const group = account.groupId as any
    const permissions = group?.permissions?.map((p: any) => p.pCode) || []

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
    await this.cacheService.set(buildRedisKey(CACHE_CONFIG.VERIFY, data.email), otp, CACHE_CONFIG.VERIFY.TTL)

    const { subject, htmlContent } = registerOtpTemplate(otp)
    this.mailProducer.publishSendOtp({ to: data.email, subject, htmlContent })
  }
}
