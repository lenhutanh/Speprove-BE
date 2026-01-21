import express from 'express'
import { topicController } from '~/controllers'
import { authMiddleware, validateMiddleware } from '~/middlewares'
import { createTopicSchema, getTopicsSchema, idParamSchema, updateTopicSchema } from '~/validations'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, validateMiddleware.validate(createTopicSchema), topicController.createNew)
  .get(authMiddleware.isAuthorizedOptional, validateMiddleware.validate(getTopicsSchema), topicController.getList)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(updateTopicSchema),
  topicController.update
)

export const topicRoutes = Router
