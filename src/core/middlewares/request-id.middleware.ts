import { randomUUID } from 'node:crypto'
import { NextFunction, Request, Response } from 'express'
import { logger } from '~/core/logging/logger'
import { runWithRequestId } from '~/core/logging/request-context'

const VALID_REQUEST_ID = /^[\w.-]{8,64}$/
const QUIET_PATHS = new Set(['/health', '/ready'])

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.header('x-request-id')
  const requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID()
  const startedAt = Date.now()

  res.setHeader('X-Request-Id', requestId)
  res.on('finish', () => {
    if (QUIET_PATHS.has(req.path)) return
    runWithRequestId(requestId, () =>
      logger.info('request', {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      })
    )
  })

  runWithRequestId(requestId, next)
}
