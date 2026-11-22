import Redis from 'ioredis'
import { getRedisOptions } from '~/common/config'
import { logger } from '~/infrastructure/logging/logger'

export function createRedisClient(name: string): Redis {
  const client = new Redis(getRedisOptions(name))
  client.on('connect', () => logger.info(`[Redis] ${name} connected`))
  client.on('error', (err) => logger.error(`[Redis] ${name} error:`, err))
  return client
}
