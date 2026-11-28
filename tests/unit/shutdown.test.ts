import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Server as SocketServer } from 'socket.io'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createShutdown } from '~/core/lifecycle/shutdown'

const TIMEOUT_MS = 3000

let server: HttpServer
let io: SocketServer
let client: WebSocket | undefined

async function startServer() {
  server = createServer((_req, res) => res.end('ok'))
  io = new SocketServer(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
}

async function connectClient() {
  const { port } = server.address() as AddressInfo
  client = new WebSocket(`ws://127.0.0.1:${port}/socket.io/?EIO=4&transport=websocket`)
  await new Promise<void>((resolve, reject) => {
    client!.addEventListener('open', () => resolve())
    client!.addEventListener('error', () => reject(new Error('WebSocket failed to connect')))
  })
}

afterEach(() => {
  client?.close()
  client = undefined
  server?.closeAllConnections()
  server?.close()
})

describe('createShutdown', () => {
  it('exits with the requested code before the timeout while a Socket.io client is connected', async () => {
    await startServer()
    await connectClient()
    const exit = vi.fn()
    const stopBackground = vi.fn(async () => undefined)

    createShutdown({ server, timeoutMs: TIMEOUT_MS, closeSocket: () => io.close(), stopBackground, exit })('SIGINT', 0)

    await vi.waitFor(() => expect(exit).toHaveBeenCalled(), { timeout: 1500 })
    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
    expect(stopBackground).toHaveBeenCalledTimes(1)
  })

  it('exits with 1 at once when a cleanup step fails', async () => {
    await startServer()
    const exit = vi.fn()
    const stopBackground = vi.fn(async () => {
      throw new Error('queue shutdown failed')
    })

    createShutdown({ server, timeoutMs: TIMEOUT_MS, closeSocket: () => io.close(), stopBackground, exit })('SIGTERM', 0)

    await vi.waitFor(() => expect(exit).toHaveBeenCalled(), { timeout: 1500 })
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('runs the cleanup once when the signal repeats', async () => {
    await startServer()
    const exit = vi.fn()
    const stopBackground = vi.fn(async () => undefined)
    const shutdown = createShutdown({
      server,
      timeoutMs: TIMEOUT_MS,
      closeSocket: () => io.close(),
      stopBackground,
      exit
    })

    shutdown('SIGINT', 0)
    shutdown('SIGINT', 0)
    shutdown('SIGTERM', 0)

    await vi.waitFor(() => expect(exit).toHaveBeenCalled(), { timeout: 1500 })
    expect(stopBackground).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledTimes(1)
  })
})
