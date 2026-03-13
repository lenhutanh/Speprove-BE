import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createTopicSchema, getTopicsSchema, updateTopicSchema } from './topic.validation'
import { bindHandler } from '~/common/utils'
import { TopicController } from './topic.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('TOPIC:CREATE'),
    validateMiddleware(createTopicSchema),
    bindHandler(TopicController, 'createNew')
  )
  .get(
    authMiddleware.isAuthorizedOptional,
    validateMiddleware(getTopicsSchema),
    bindHandler(TopicController, 'getList')
  )

router
  .route('/:id')
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('TOPIC:UPDATE'),
    validateMiddleware(updateTopicSchema),
    bindHandler(TopicController, 'update')
  )
export const topicRoutes = router
