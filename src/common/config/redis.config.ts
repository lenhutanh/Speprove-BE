import { RedisOptions } from 'ioredis'
import { env } from './env.config'

export function getRedisOptions(connectionName?: string): RedisOptions {
  return {
    ...(env.REDIS.URL
      ? { url: env.REDIS.URL }
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
