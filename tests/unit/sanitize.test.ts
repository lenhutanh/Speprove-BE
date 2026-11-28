import { Types } from 'mongoose'
import { describe, expect, it } from 'vitest'
import { sanitize } from '~/core/logging/sanitize'

describe('sanitize', () => {
  it('redacts sensitive keys at any depth', () => {
    const result = sanitize({
      email: 'user@example.com',
      password: 'secret-1',
      nested: { accessToken: 'abc', headers: { Authorization: 'Bearer abc', cookie: 'sid=1' } }
    })

    expect(result).toEqual({
      email: 'user@example.com',
      password: '[redacted]',
      nested: { accessToken: '[redacted]', headers: { Authorization: '[redacted]', cookie: '[redacted]' } }
    })
  })

  it('writes dates as ISO strings and ObjectIds as hex strings', () => {
    const id = new Types.ObjectId()

    expect(sanitize({ at: new Date('2026-01-02T03:04:05.000Z'), id })).toEqual({
      at: '2026-01-02T03:04:05.000Z',
      id: id.toHexString()
    })
  })

  it('redacts keys that appear in the output of toJSON', () => {
    const document = { toJSON: () => ({ name: 'learner', password: 'hash' }) }

    expect(sanitize({ account: document })).toEqual({ account: { name: 'learner', password: '[redacted]' } })
  })

  it('keeps only the name, message and stack of an error', () => {
    const error = Object.assign(new Error('boom'), { config: { headers: { authorization: 'Bearer abc' } } })

    expect(Object.keys(sanitize(error) as object)).toEqual(['name', 'message', 'stack'])
  })

  it('stops at a maximum depth, even for circular objects', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(JSON.stringify(sanitize(circular))).toContain('[truncated]')
  })
})
