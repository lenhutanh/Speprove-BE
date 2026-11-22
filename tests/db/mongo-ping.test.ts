import { afterAll, describe, expect, it } from 'vitest'
import { pingDB } from '~/common/config/mongodb.config'
import { startMongo, stopMongo } from '../helpers/mongo'

describe('pingDB', () => {
  afterAll(stopMongo)

  it('rejects while MongoDB is not connected', async () => {
    await expect(pingDB()).rejects.toThrow('MongoDB is not connected')
  })

  it('resolves once MongoDB is connected', async () => {
    await startMongo()

    await expect(pingDB()).resolves.toBeUndefined()
  })
})
