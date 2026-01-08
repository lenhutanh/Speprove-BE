import Redis from 'ioredis'
import { env } from '~/config/env.config'

const redisUri =
  env.REDIS.URL ||
  (env.REDIS.PASSWORD
    ? `redis://:${env.REDIS.PASSWORD}@${env.REDIS.HOST}:${env.REDIS.PORT}`
    : `redis://${env.REDIS.HOST}:${env.REDIS.PORT}`)

const redisClient = new Redis(redisUri, {
  maxRetriesPerRequest: null
})

const setCache = async (key: string, value: any, ttlSeconds?: number): Promise<void> => {
  const data = typeof value === 'string' ? value : JSON.stringify(value)
  if (ttlSeconds) {
    await redisClient.set(key, data, 'EX', ttlSeconds)
  } else {
    await redisClient.set(key, data)
  }
}

const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key)
  if (!data) return null

  try {
    if ((data.startsWith('{') && data.endsWith('}')) || (data.startsWith('[') && data.endsWith(']'))) {
      return JSON.parse(data) as T
    }
    return data as unknown as T
  } catch {
    return data as unknown as T
  }
}

const deleteCacheByPrefix = async (prefix: string): Promise<void> => {
  const stream = redisClient.scanStream({
    match: `${prefix}*`,
    count: 100
  })

  for await (const keys of stream) {
    if (keys.length > 0) {
      await redisClient.del(...keys)
    }
  }
}

const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key)
}

const setWithKeepTTL = async (key: string, value: any): Promise<void> => {
  const data = typeof value === 'string' ? value : JSON.stringify(value)
  await redisClient.set(key, data, 'KEEPTTL')
}

const incr = async (key: string): Promise<number> => {
  return await redisClient.incr(key)
}

export const RedisProvider = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPrefix,
  setWithKeepTTL,
  incr
}
