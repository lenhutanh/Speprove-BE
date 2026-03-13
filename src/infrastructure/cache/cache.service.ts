import Redis from 'ioredis'
import { ICacheService } from './cache.interface'
import { createRedisClient } from '../redis/redis.factory'
import { singleton } from 'tsyringe'

@singleton()
export class CacheService implements ICacheService {
  private readonly redis: Redis

  constructor() {
    this.redis = createRedisClient('cache')
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  public async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  public async clearPrefix(prefix: string): Promise<void> {
    const stream = this.redis.scanStream({ match: `${prefix}:*`, count: 100 })

    for await (const keys of stream as AsyncIterable<string[]>) {
      if (keys.length === 0) continue
      const pipeline = this.redis.pipeline()
      pipeline.del(...keys)
      await pipeline.exec()
    }
  }
}
