import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.config'
import { closeDB, connectDB } from './config/mongodb.config'
import { env } from './config/env.config'
import { errorMiddleware } from './middlewares/error.middleware'
import helmet from 'helmet'
import cors from 'cors'
import { corsOptions } from './config/cors.config'
import { APIs_V1 } from './routes/v1'
import cookieParser from 'cookie-parser'

const startServer = () => {
  const app = express()

  app.use(cookieParser())

  app.use(helmet())

  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/api/v1', APIs_V1)

  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use(errorMiddleware)

  const server = app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`4. Backend Server is running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })

  const exitHandler = async () => {
    if (server) {
      server.close(async () => {
        console.log('5. Server closing...')
        await closeDB()
        process.exit(0)
      })
    }
  }

  process.on('SIGINT', exitHandler)
  process.on('SIGTERM', exitHandler)
}

;(async () => {
  try {
    console.log('1. Connecting to MongoDB...')
    await connectDB()
    console.log('3. Starting Server...')
    startServer()
  } catch (error) {
    console.error('Failed to start server: ', error)
    process.exit(1)
  }
})()
