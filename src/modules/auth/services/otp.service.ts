import { buildRedisKey } from '~/common/utils'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ICacheService } from '~/infrastructure/cache'
import { CACHE_CONFIG } from '../auth.constants'

@singleton()
export class OtpService {
  constructor(@inject(TOKENS.ICacheService) private readonly cacheService: ICacheService) {}
  public async storeOtp(email: string, otp: string): Promise<void> {
    const key = buildRedisKey(CACHE_CONFIG.VERIFY, email)
    return await this.cacheService.set(key, otp, CACHE_CONFIG.VERIFY.TTL)
  }

  public async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = buildRedisKey(CACHE_CONFIG.VERIFY, email)
    const cachedOtp = await this.cacheService.get<string>(key)

    if (!cachedOtp || cachedOtp !== otp) return false

    await this.cacheService.delete(key)
    return true
  }

  public async deleteOtp(email: string): Promise<void> {
    const key = buildRedisKey(CACHE_CONFIG.VERIFY, email)
    await this.cacheService.delete(key)
  }
}
