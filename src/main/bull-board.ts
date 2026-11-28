import { Express } from 'express'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { container } from 'tsyringe'
import { QueueRegistry } from '~/core/queue/queue.registry'
import { logger } from '~/core/logging/logger'

export const setupBullBoard = (app: Express): void => {
  const queueRegistry = container.resolve(QueueRegistry)

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const adapters = queueRegistry.getAllQueues().map((q) => new BullMQAdapter(q))
  createBullBoard({ queues: adapters, serverAdapter })

  app.use('/admin/queues', serverAdapter.getRouter())
  logger.info('[BullBoard] Dashboard ready at /admin/queues')
}
