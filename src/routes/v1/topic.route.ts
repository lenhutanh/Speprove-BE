import express from 'express'
import { topicController } from '~/controllers'
import { authMiddleware, validateMiddleware } from '~/middlewares'
import { createTopicSchema, updateTopicSchema } from '~/validations'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(createTopicSchema),
  topicController.createNew
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(updateTopicSchema),
  topicController.update
)

export const topicRoutes = Router
