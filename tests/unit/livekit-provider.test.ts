import { afterEach, describe, expect, it, vi } from 'vitest'

const { clientArgs } = vi.hoisted(() => ({ clientArgs: [] as unknown[][] }))

vi.mock('livekit-server-sdk', () => ({
  AccessToken: class {},
  TrackSource: {},
  TrackType: {},
  RoomServiceClient: class {
    constructor(...args: unknown[]) {
      clientArgs.push(args)
    }
  }
}))

describe('LiveKitProvider', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    clientArgs.length = 0
  })

  it('gives the LiveKit client its request timeout in seconds', async () => {
    vi.stubEnv('LIVEKIT_URL', 'wss://livekit.example.test')
    vi.stubEnv('LIVEKIT_API_KEY', 'key')
    vi.stubEnv('LIVEKIT_API_SECRET', 'secret')
    vi.stubEnv('HTTP_TIMEOUT_MS', '30000')
    vi.resetModules()

    const { LiveKitProvider } = await import('~/modules/voice-room/adapters/livekit.provider')
    new LiveKitProvider()

    expect(clientArgs[0][3]).toEqual({ requestTimeout: 30 })
  })
})
