import { Express } from 'express'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { container } from 'tsyringe'
import { QueueFactory } from './queues/queue.factory'

export const setupBullBoard = (app: Express): void => {
  const queueFactory = container.resolve(QueueFactory)

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const adapters = queueFactory.getAllQueues().map((q) => new BullMQAdapter(q))
  createBullBoard({ queues: adapters, serverAdapter })

  app.use('/admin/queues', serverAdapter.getRouter())
  console.log('[BullBoard] Dashboard ready at /admin/queues')
}
