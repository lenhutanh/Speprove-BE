import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'

export type ReadinessCheck = () => Promise<void>

const CHECK_TIMEOUT_MS = 2000

const withTimeout = (check: ReadinessCheck): Promise<void> =>
  Promise.race([
    check(),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS).unref())
  ])

/**
 * /health: the process is alive (liveness probe, no dependencies).
 * /ready: the dependencies answer (readiness probe); 503 when one does not.
 */
export function createHealthRouter(checks: Record<string, ReadinessCheck> = {}): Router {
  const router = Router()

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) })
  })

  router.get('/ready', async (_req, res) => {
    const entries = await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        try {
          await withTimeout(check)
          return [name, 'ok'] as const
        } catch {
          return [name, 'down'] as const
        }
      })
    )
    const dependencies = Object.fromEntries(entries)
    const ready = entries.every(([, status]) => status === 'ok')

    res.status(ready ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json({
      status: ready ? 'ok' : 'unavailable',
      dependencies
    })
  })

  return router
}
