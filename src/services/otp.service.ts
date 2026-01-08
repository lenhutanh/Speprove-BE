import { RedisProvider } from '~/providers/redis.provider'
import { generateOtp } from '~/utils/index'
import { CACHE_CONFIG } from '~/config/cache.config'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/api-error'

export const OtpService = {
  storeOtp: async (email: string, otp: string) => {
    const key = `${CACHE_CONFIG.OTP.PREFIX}${email}`
    await RedisProvider.setCache(key, otp, CACHE_CONFIG.OTP.TTL)
  },

  verifyOtp: async (email: string, otp: string): Promise<boolean> => {
    const key = `${CACHE_CONFIG.OTP.PREFIX}${email}`
    const cachedOtp = await RedisProvider.getCache<string>(key)

    if (!cachedOtp || cachedOtp !== otp) {
      return false
    }

    await RedisProvider.deleteCache(key)
    return true
  },

  handleResendLimit: async (email: string): Promise<string> => {
    const resendKey = `otp:resend_limit:${email}`

    const resendCount = await RedisProvider.incr(resendKey)

    if (resendCount === 1) {
      await RedisProvider.redisClient.expire(resendKey, 600)
    }

    if (resendCount > 3) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Bạn đã gửi OTP quá 3 lần. Vui lòng thử lại sau 10 phút.')
    }

    const otp = generateOtp()
    await OtpService.storeOtp(email, otp)

    return otp
  },
  deleteOtp: async (email: string) => {
    const key = `${CACHE_CONFIG.OTP.PREFIX}${email}`
    await RedisProvider.deleteCache(key)
  }
}
