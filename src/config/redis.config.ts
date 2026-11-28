import { RedisOptions } from 'ioredis'
import { env } from './env.config'

// REDIS_URL (redis:// or rediss://) takes precedence over REDIS_HOST/PORT/PASSWORD
function connectionFromUrl(url: string): RedisOptions {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    ...(parsed.protocol === 'rediss:' ? { tls: {} } : {})
  }
}

export function getRedisOptions(connectionName?: string): RedisOptions {
  return {
    ...(env.REDIS.URL
      ? connectionFromUrl(env.REDIS.URL)
      : {
          host: env.REDIS.HOST,
          port: env.REDIS.PORT,
          password: env.REDIS.PASSWORD
        }),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectionName
  }
}
