import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createQuestionSchema, getQuestionsSchema, updateQuestionSchema } from './question.validation'
import { bindHandler } from '~/common/utils'
import { QuestionController } from './question.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const Router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('QUESTION:CREATE'),
    validateMiddleware(createQuestionSchema),
    bindHandler(QuestionController, 'createNew')
  )
  .get(
    authMiddleware.isAuthorizedOptional,
    validateMiddleware(getQuestionsSchema),
    bindHandler(QuestionController, 'getList')
  )

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  authMiddleware.hasPermission('QUESTION:UPDATE'),
  validateMiddleware(updateQuestionSchema),
  bindHandler(QuestionController, 'update')
)

export const questionRoutes = Router
