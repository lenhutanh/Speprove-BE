import Redis from 'ioredis'
import { singleton } from 'tsyringe'
import { createRedisClient } from '../redis/redis.factory'
import { buildRedisKey } from '~/infrastructure/redis/redis-key.util'
import { RateLimitResult } from './rate-limiter.types'

type RateLimitRedis = Redis & {
  rateLimitLog(key: string, seqKey: string, nowMs: number, windowMs: number, limit: number): Promise<[number, number]>
  rateLimitCounter(
    currKey: string,
    prevKey: string,
    windowMs: number,
    limit: number,
    nowMs: number
  ): Promise<[number, number]>
}

const RATE_LIMIT_CONFIG = {
  STRICT: { PREFIX: 'rl:str' },
  FAST: { PREFIX: 'rl:fst' }
} as const

@singleton()
export class RateLimiterService {
  private readonly redis: RateLimitRedis

  private readonly LUA_LOG = `
    local key, seqKey = KEYS[1], KEYS[2]
    local now, window, limit = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
    local current = redis.call('ZCARD', key)
    if current >= limit then return {0, current} end
    local seq = redis.call('INCR', seqKey)
    redis.call('ZADD', key, now, now .. "-" .. seq)
    local ttlMs = window * 2
    redis.call('PEXPIRE', key, ttlMs)
    redis.call('PEXPIRE', seqKey, ttlMs)
    return {1, current + 1}
  `

  private readonly LUA_COUNTER = `
    local curr_key, prev_key = KEYS[1], KEYS[2]
    local window, limit, now = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
    local curr_count = tonumber(redis.call('GET', curr_key) or "0")
    local prev_count = tonumber(redis.call('GET', prev_key) or "0")
    local total = curr_count + (prev_count * (1 - ((now % window) / window)))
    if total >= limit then return {0, math.floor(total)} end
    local new_count = redis.call('INCR', curr_key)
    if new_count == 1 then redis.call('PEXPIRE', curr_key, window * 2) end
    return {1, math.floor(total + 1)}
  `

  constructor() {
    this.redis = createRedisClient('rate-limiter') as RateLimitRedis
    this.redis.defineCommand('rateLimitLog', { numberOfKeys: 2, lua: this.LUA_LOG })
    this.redis.defineCommand('rateLimitCounter', { numberOfKeys: 2, lua: this.LUA_COUNTER })
  }

  public async isAllowedStrict(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    try {
      const nowMs = Date.now()
      const redisKey = buildRedisKey(RATE_LIMIT_CONFIG.STRICT, `{${key}}`)
      const seqKey = buildRedisKey(RATE_LIMIT_CONFIG.STRICT, `{${key}}:seq`)

      const result = await this.redis.rateLimitLog(redisKey, seqKey, nowMs, windowMs, limit)

      const allowed = result[0] === 1

      let retryAfter: number | undefined

      if (!allowed) {
        const ttl = await this.redis.pttl(redisKey)
        retryAfter = ttl > 0 ? Math.ceil(ttl / 1000) : Math.ceil(windowMs / 1000)
      }

      return {
        allowed,
        remaining: Math.max(0, limit - result[1]),
        retryAfter
      }
    } catch (error) {
      console.error(`[RateLimiter] Strict mode failed for key ${key}:`, error)
      return { allowed: false, remaining: 0 }
    }
  }

  public async isAllowedFast(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    try {
      const nowMs = Date.now()
      const currentIdx = Math.floor(nowMs / windowMs)
      const prevIdx = currentIdx - 1

      const currKey = buildRedisKey(RATE_LIMIT_CONFIG.FAST, `{${key}}:${currentIdx}`)
      const prevKey = buildRedisKey(RATE_LIMIT_CONFIG.FAST, `{${key}}:${prevIdx}`)

      const result = await this.redis.rateLimitCounter(currKey, prevKey, windowMs, limit, nowMs)

      const allowed = result[0] === 1

      let retryAfter: number | undefined

      if (!allowed) {
        const remainingWindow = windowMs - (nowMs % windowMs)
        retryAfter = Math.ceil(remainingWindow / 1000)
      }

      return {
        allowed,
        remaining: Math.max(0, limit - result[1]),
        retryAfter
      }
    } catch (error) {
      console.error(`[RateLimiter] Fast mode failed for key ${key}. Failing open.`, error)
      return { allowed: true, remaining: limit }
    }
  }

  async shutdown(): Promise<void> {
    await this.redis.quit()
  }
}
