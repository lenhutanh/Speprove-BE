import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { getForecastTopicSchema, importQuestionsSchema } from './forecast-topic.validation'
import { bindHandler } from '~/common/utils'
import { ForecastTopicController } from './forecast-topic.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router.route('/').get(validateMiddleware(getForecastTopicSchema), bindHandler(ForecastTopicController, 'getList'))

router.route('/:id').get(bindHandler(ForecastTopicController, 'getDetails'))
router
  .route('/:id/import-questions')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(importQuestionsSchema),
    bindHandler(ForecastTopicController, 'importQuestions')
  )

export const forecastTopicRoutes = router
