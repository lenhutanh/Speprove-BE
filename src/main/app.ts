import express, { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from '../config/env.config'
import { corsOptions } from '../config/cors.config'
import { errorMiddleware } from '../core/middlewares/error.middleware'
import { requestIdMiddleware } from '../core/middlewares/request-id.middleware'
import { APIs_V1 } from './routes'
import { createHealthRouter, ReadinessCheck } from '../core/lifecycle/health.route'

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

  beforeRoutes?.(app)

  app.use('/api/v1', APIs_V1)
  app.use(errorMiddleware)

  return app
}
