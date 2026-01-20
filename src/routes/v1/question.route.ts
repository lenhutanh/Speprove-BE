import express from 'express'
import { questionController } from '~/controllers'
import { authMiddleware, validateMiddleware } from '~/middlewares'
import { createQuestionSchema, updateQuestionSchema } from '~/validations'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(createQuestionSchema),
  questionController.createNew
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(updateQuestionSchema),
  questionController.update
)

export const questionRoutes = Router
