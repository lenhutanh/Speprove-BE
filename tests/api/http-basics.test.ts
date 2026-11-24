import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '~/app'
import { setupTestContainer } from '../helpers/test-container'
import { accessTokenFor } from '../helpers/tokens'

describe('HTTP basics', () => {
  let ready = true
  let app: ReturnType<typeof createApp>

  beforeAll(() => {
    setupTestContainer()
    app = createApp({
      readinessChecks: {
        mongo: async () => {
          if (!ready) throw new Error('down')
        }
      }
    })
  })

  it('GET /health answers 200 without touching dependencies', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('the health probes carry the helmet headers and hide X-Powered-By', async () => {
    for (const path of ['/health', '/ready']) {
      const res = await request(app).get(path)
      expect(res.headers['x-powered-by'], path).toBeUndefined()
      expect(res.headers['x-content-type-options'], path).toBe('nosniff')
    }
  })

  it('GET /ready is 200 when dependencies answer and 503 when one is down', async () => {
    ready = true
    expect((await request(app).get('/ready')).status).toBe(200)

    ready = false
    const res = await request(app).get('/ready')
    expect(res.status).toBe(503)
    expect(res.body.dependencies.mongo).toBe('down')
  })

  it('keeps a valid X-Request-Id and replaces an invalid one', async () => {
    const kept = await request(app).get('/health').set('X-Request-Id', 'trace-abc-12345')
    expect(kept.headers['x-request-id']).toBe('trace-abc-12345')

    const replaced = await request(app).get('/health').set('X-Request-Id', 'bad id with spaces')
    expect(replaced.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('rejects a protected route without a token and returns the request id in the error', async () => {
    const res = await request(app).get('/api/v1/attempt')
    expect(res.status).toBe(401)
    expect(res.body.errorCode).toBe('AUTH_007')
    expect(res.body.requestId).toBe(res.headers['x-request-id'])
  })

  it('rejects an invalid token', async () => {
    const res = await request(app).get('/api/v1/attempt').set('Authorization', 'Bearer not-a-token')
    expect(res.status).toBe(401)
  })

  it('answers 403 when the token lacks the permission of an admin route', async () => {
    const res = await request(app)
      .post('/api/v1/group')
      .set('Authorization', `Bearer ${accessTokenFor([])}`)
      .send({})
    expect(res.status).toBe(403)
  })

  it('answers 404 for an unknown route', async () => {
    expect((await request(app).get('/api/v1/does-not-exist')).status).toBe(404)
  })
})
