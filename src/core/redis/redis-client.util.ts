import Redis from 'ioredis'
import { getRedisOptions } from '~/config/redis.config'
import { logger } from '~/core/logging/logger'
import { runOutsideRequest } from '~/core/logging/request-context'

export function createRedisClient(name: string): Redis {
  // ioredis opens its socket in the constructor and keeps the async context of the request that created it
  const client = runOutsideRequest(() => new Redis(getRedisOptions(name)))
  client.on('connect', () => logger.info(`[Redis] ${name} connected`))
  client.on('error', (err) => logger.error(`[Redis] ${name} error:`, err))
  return client
}
