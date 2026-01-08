import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import { ApiError } from '~/utils/api-error'
import { generateToken, verifyToken } from '~/utils/jwt.util'
import { env } from '~/config/env.config'
import { accountService } from './account.service'
import { PermissionType } from '~/models'
import { STATUS, TOKEN_TYPE } from '~/constants/constants'
import { generateOtp } from '~/utils'
import { OtpService } from './otp.service'
import { RedisProvider } from '~/providers/redis.provider'
import { MailProvider } from '~/providers/mail.provider'
import { registerOtpTemplate } from '~/resources/mail-templates'
import { CACHE_CONFIG } from '~/config/cache.config'
import { JwtPayload } from 'jsonwebtoken'
import { LoginBodyType, RegisterBodyType, VerifyBodyType } from '~/types'

const login = async (data: LoginBodyType) => {
  const account = await accountService.findByEmail(data.email)
  if (!account) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  }

  if (account.status === STATUS.PENDING) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Account is not verified')
  }

  const isMatch = await bcrypt.compare(data.password, account.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
  }

  const permissions = account.group?.permissions?.map((p: PermissionType) => p.pCode) || []

  const payload = { _id: account._id, email: account.email, permissions }

  return {
    accessToken: generateToken(
      { ...payload, type: TOKEN_TYPE.ACCESS },
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    ),
    refreshToken: generateToken(
      { ...payload, type: TOKEN_TYPE.REFRESH },
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
  }
}

const register = async (data: RegisterBodyType) => {
  const account = await accountService.findByEmail(data.email)

  if (account) {
    throw new ApiError(StatusCodes.CONFLICT, 'Account already exists')
  }

  if (data.password !== data.confirmedPassword) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Password and Confirm Password do not match')
  }

  const otp = generateOtp()
  await OtpService.storeOtp(data.email, otp)

  const tempData = {
    email: data.email,
    password: bcrypt.hashSync(data.password, 10)
  }

  await RedisProvider.setCache(`${CACHE_CONFIG.REGISTER.PREFIX}:${data.email}`, tempData)
  const { subject, content } = registerOtpTemplate(otp)

  await MailProvider.sendEmail(data.email, subject, content)

  return
}

const verify = async (data: VerifyBodyType) => {
  const existedAccount = await accountService.findByEmail(data.email)
  if (existedAccount) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already verified!')
  }

  const cacheKey = `${CACHE_CONFIG.REGISTER.PREFIX}:${data.email}`
  const tempUserData: any = await RedisProvider.getCache(cacheKey)

  if (!tempUserData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Registration request expired or not found')
  }

  const isOtpValid = await OtpService.verifyOtp(data.email, data.otp)
  if (!isOtpValid) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'OTP does not match or expired')
  }

  await RedisProvider.deleteCache(cacheKey)
  await OtpService.deleteOtp(data.email)

  return await accountService.createUser(tempUserData)
}

const refreshToken = async (token: string) => {
  const decoded = (await verifyToken(token, env.REFRESH_TOKEN_SECRET_SIGNATURE)) as JwtPayload

  if (decoded.type !== TOKEN_TYPE.REFRESH) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token type')
  }

  const account = await accountService.findByEmail(decoded.email)

  if (!account) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  if (account.status === STATUS.LOCKED || account.status === STATUS.DELETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account is locked or deleted')
  }

  const permissions = account.group?.permissions?.map((p: PermissionType) => p.pCode) || []

  const payload: JwtPayload = {
    _id: account._id,
    email: account.email,
    permissions,
    type: TOKEN_TYPE.ACCESS
  }

  return {
    accessToken: generateToken(payload, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
  }
}
export const authService = {
  login,
  register,
  verify,
  refreshToken
}
