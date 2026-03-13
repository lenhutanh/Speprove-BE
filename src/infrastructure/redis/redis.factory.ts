import Redis from 'ioredis'
import { getRedisOptions } from '~/common/config'

export function createRedisClient(name: string): Redis {
  const client = new Redis(getRedisOptions(name))
  client.on('connect', () => console.log(`[Redis] ${name} connected`))
  client.on('error', (err) => console.error(`[Redis] ${name} error:`, err))
  return client
}
