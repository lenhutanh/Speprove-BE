import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import {
  createQuestionSchema,
  getQuestionAudioSchema,
  getQuestionsSchema,
  updateQuestionSchema
} from './question.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { QuestionController } from './question.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'

const Router = express.Router()

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

Router.route('/:id/audio').get(
  validateMiddleware(getQuestionAudioSchema),
  bindHandler(QuestionController, 'getQuestionAudio')
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  authMiddleware.hasPermission('QUESTION:UPDATE'),
  validateMiddleware(updateQuestionSchema),
  bindHandler(QuestionController, 'update')
)

export const questionRoutes = Router
