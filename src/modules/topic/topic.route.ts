import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createTopicSchema, getTopicsSchema, updateTopicSchema } from './topic.validation'
import { bindHandler } from '~/common/http'
import { TopicController } from './topic.controller'
import { authMiddleware } from '~/common/middlewares/auth.middleware'

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
