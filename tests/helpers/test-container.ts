import { container } from 'tsyringe'
import { setupContainer } from '~/bootstrap/container'
import { TOKENS } from '~/common/constants/di.tokens'
import { RateLimiterService } from '~/infrastructure/rate-limiter/rate-limiter.service'
import { QueueFactory } from '~/infrastructure/queues/queue.factory'

class MemoryCache {
  private readonly store = new Map<string, string>()
  async get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key)
    return value ? (JSON.parse(value) as T) : null
  }
  async set<T>(key: string, value: T) {
    this.store.set(key, JSON.stringify(value))
  }
  async delete(key: string) {
    this.store.delete(key)
  }
  async clearPrefix(prefix: string) {
    for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key)
  }
  async incr(key: string) {
    const next = Number(this.store.get(key) ?? 0) + 1
    this.store.set(key, String(next))
    return next
  }
  async expire() {}
  async ping() {}
}

const allowAll = async () => ({ allowed: true, remaining: 99, retryAfter: 0 })

export function setupTestContainer() {
  setupContainer()
  container.registerInstance(TOKENS.ICacheService, new MemoryCache())
  container.registerInstance(RateLimiterService, { isAllowedStrict: allowAll, isAllowedFast: allowAll } as never)
  container.registerInstance(QueueFactory, {
    initQueues: () => undefined,
    shutdown: async () => undefined,
    getQueue: () => ({ add: async () => ({}), addBulk: async () => [] })
  } as never)
}
