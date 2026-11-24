import type { Server } from 'node:http'
import { logger } from '~/infrastructure/logging/logger'

interface ShutdownOptions {
  server: Server
  timeoutMs: number
  closeSocket: () => void
  stopBackground: () => Promise<void>
  exit?: (code: number) => void
}

export function createShutdown({
  server,
  timeoutMs,
  closeSocket,
  stopBackground,
  exit = (code) => process.exit(code)
}: ShutdownOptions) {
  let shuttingDown = false

  return (reason: string, exitCode: number) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.info(`${reason}: shutting down`)

    setTimeout(() => {
      logger.error('Shutdown timed out, forcing exit')
      exit(1)
    }, timeoutMs).unref()

    server.close(async () => {
      await stopBackground()
      closeSocket()
      logger.info('Shutdown complete')
      exit(exitCode)
    })
    server.closeIdleConnections()
  }
}
