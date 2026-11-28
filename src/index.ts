import 'reflect-metadata'
import { container } from 'tsyringe'
import { createApp } from './main/app'
import { setupContainer } from './main/container'
import { TOKENS } from './core/di/di.constants'
import { connectDB, closeDB, pingDB } from './config/mongodb.config'
import { env } from './config/env.config'
import { corsOptions } from './config/cors.config'
import { ICacheService } from './core/cache/cache.service.interface'
import { setupBullBoard } from './main/bull-board'
import { logger } from './core/logging/logger'
import { QueueRegistry } from './core/queue/queue.registry'
import { createShutdown } from './core/lifecycle/shutdown'
import { initSocket, closeSocket } from './main/socket'
import { startWorkers, shutdownWorkers } from './main/workers'
import { initQuestionSpelling } from './modules/content/question/question-spelling.service'
;(async () => {
  try {
    await initQuestionSpelling()
    setupContainer()

    logger.info('Connecting to MongoDB')
    await connectDB()

    // Queues first, so Bull Board and the workers see all of them
    const queueRegistry = container.resolve(QueueRegistry)
    queueRegistry.initQueues()

    startWorkers()

    const cache = container.resolve<ICacheService>(TOKENS.ICacheService)
    const app = createApp({
      beforeRoutes: (app) => {
        if (env.NODE_ENV !== 'production') setupBullBoard(app)
      },
      readinessChecks: { mongo: pingDB, redis: () => cache.ping() }
    })

    const server = app.listen(env.APP_PORT, env.APP_HOST, () => {
      logger.info(`Server running at http://${env.APP_HOST}:${env.APP_PORT}/`)
    })

    initSocket(server, corsOptions)

    const shutdown = createShutdown({
      server,
      timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
      closeSocket,
      stopBackground: async () => {
        // Workers stop before the queues they read from
        await shutdownWorkers()
        await queueRegistry.shutdown()
        await closeDB()
      }
    })

    process.on('SIGINT', () => shutdown('SIGINT', 0))
    process.on('SIGTERM', () => shutdown('SIGTERM', 0))
    // Fatal errors still end the process with exit code 1, after a graceful shutdown
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', reason)
      shutdown('unhandledRejection', 1)
    })
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error)
      shutdown('uncaughtException', 1)
    })
  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }
})()
