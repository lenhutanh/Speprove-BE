import { describe, expect, it, vi } from 'vitest'
import { runWithRequestId } from '~/infrastructure/logging/request-context'

const { seen } = vi.hoisted(() => ({ seen: [] as Array<string | undefined> }))

vi.mock('ioredis', async () => {
  const { getRequestId } = await import('~/infrastructure/logging/request-context')
  return {
    default: class {
      constructor() {
        seen.push(getRequestId())
      }
      on() {
        return this
      }
    }
  }
})

describe('createRedisClient', () => {
  it('constructs the client outside the request that first needs it', async () => {
    const { createRedisClient } = await import('~/infrastructure/redis/redis.factory')

    runWithRequestId('abc', () => createRedisClient('test'))

    expect(seen).toEqual([undefined])
  })
})
