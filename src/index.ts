import 'reflect-metadata'
import { container } from 'tsyringe'
import { createApp } from './app'
import { setupContainer } from './bootstrap/container'
import { TOKENS } from './common/constants/di.tokens'
import { connectDB, closeDB, pingDB, env, corsOptions } from './common/config'
import { ICacheService } from './infrastructure/cache/cache.interface'
import { setupBullBoard } from './infrastructure/bull-board.config'
import { logger } from './infrastructure/logging/logger'
import { QueueFactory } from './infrastructure/queues/queue.factory'
import { createShutdown } from './infrastructure/shutdown'
import { initSocket, closeSocket } from './infrastructure/socket/socket-boostrap'
import { startWorkers, shutdownWorkers } from './infrastructure/workers/worker.setup'
import { initQuestionSpelling } from './modules/question/question-spelling.service'
;(async () => {
  try {
    await initQuestionSpelling()
    setupContainer()

    logger.info('Connecting to MongoDB')
    await connectDB()

    // Queues first, so Bull Board and the workers see all of them
    const queueFactory = container.resolve(QueueFactory)
    queueFactory.initQueues()

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
        await queueFactory.shutdown()
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
