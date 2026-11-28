import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { createTopicSchema, getTopicsSchema, updateTopicSchema } from './topic.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { TopicController } from './topic.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'

const router = express.Router()

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
