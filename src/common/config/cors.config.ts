import { CorsOptions } from 'cors'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/common/config/env.config'
import { AppError } from '../errors'

export const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow direct navigation, server-to-server requests, Postman, and OAuth redirects.
    if (!origin) {
      return callback(null, true)
    }

    if (env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(new AppError(`${origin} not allowed by our CORS Policy.`, StatusCodes.FORBIDDEN))
  },

  credentials: true,
  optionsSuccessStatus: 200
}
