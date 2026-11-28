import type { Server } from 'node:http'
import { logger } from '~/core/logging/logger'

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

  const stop = async () => {
    // Socket.io connections keep the HTTP server open, so they must be closed before waiting for it
    closeSocket()
    const httpClosed = new Promise<void>((resolve) => server.close(() => resolve()))
    server.closeIdleConnections()
    await httpClosed
    await stopBackground()
  }

  return (reason: string, exitCode: number) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.info(`${reason}: shutting down`)

    setTimeout(() => {
      logger.error('Shutdown timed out, forcing exit')
      exit(1)
    }, timeoutMs).unref()

    stop()
      .then(() => {
        logger.info('Shutdown complete')
        exit(exitCode)
      })
      .catch((error) => {
        logger.error('Shutdown failed', error)
        exit(1)
      })
  }
}
