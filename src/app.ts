import express, { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { env, swaggerSpec, corsOptions } from './common/config'
import { errorMiddleware, requestIdMiddleware } from './common/middlewares'
import { APIs_V1 } from './routes'
import { createHealthRouter, ReadinessCheck } from './infrastructure/health/health.router'

interface CreateAppOptions {
  beforeRoutes?: (app: Express) => void
  readinessChecks?: Record<string, ReadinessCheck>
}

export function createApp({ beforeRoutes, readinessChecks }: CreateAppOptions = {}): Express {
  const app = express()

  app.set('trust proxy', env.TRUST_PROXY)

  app.use(requestIdMiddleware)
  app.use(helmet())
  app.use(createHealthRouter(readinessChecks))
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())

  if (env.NODE_ENV !== 'production') {
    app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  }
  beforeRoutes?.(app)

  app.use('/api/v1', APIs_V1)
  app.use(errorMiddleware)

  return app
}
