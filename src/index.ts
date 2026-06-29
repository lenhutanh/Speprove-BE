import 'reflect-metadata'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { setupContainer } from './bootstrap/container'
import { initQuestionSpelling } from './modules/question/question-spelling.service'
import { SocketService } from './infrastructure/socket/socket.service'
;(async () => {
  try {
    await initQuestionSpelling()
    setupContainer()

    const { connectDB, closeDB } = await import('./common/config')
    const { env, swaggerSpec, corsOptions } = await import('./common/config')
    const { APIs_V1 } = await import('./routes')
    const { errorMiddleware } = await import('./common/middlewares')
    const { setupBullBoard } = await import('./infrastructure/bull-board.config')
    const { startWorkers, shutdownWorkers } = await import('./infrastructure/workers/worker.setup')
    const { EventBus } = await import('./infrastructure/event-bus/event-bus')
    const { QueueFactory } = await import('./infrastructure/queues/queue.factory')
    const { container } = await import('tsyringe')

    // 3. Kết nối DB
    console.log('1. Connecting to MongoDB...')
    await connectDB()
    console.log('2. MongoDB connected\n')

    // 4. Init queues trước — đảm bảo BullBoard và Worker thấy đủ queues
    const queueFactory = container.resolve(QueueFactory)
    queueFactory.initQueues()

    // 5. Kích hoạt EventBus
    console.log('3. Registering event handlers...')
    const eventBus = container.resolve(EventBus)
    eventBus.registerHandlers()

    // 6. Start workers
    startWorkers()

    // 7. Khởi động Express
    console.log('5. Starting server...')
    const app = express()

    app.use(cookieParser())
    app.use(helmet())
    app.use(cors(corsOptions))
    app.use(express.json())

    if (env.NODE_ENV !== 'production') {
      app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
      setupBullBoard(app) // ← queue đã init, luôn thấy đủ
    }

    app.use('/api/v1', APIs_V1)
    app.use(errorMiddleware)

    const server = app.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(`6. Server running at http://${env.APP_HOST}:${env.APP_PORT}/\n`)
    })

    // Socket
    const socketService = container.resolve(SocketService)
    socketService.init(server, corsOptions)

    // 8. Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...')
      server.close(async () => {
        await shutdownWorkers() // worker trước
        await queueFactory.shutdown() // queue sau
        await closeDB()
        socketService.close()
        console.log('✅ Shutdown complete')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
})()
