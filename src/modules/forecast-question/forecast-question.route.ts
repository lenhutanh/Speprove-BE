import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { bindHandler } from '~/common/http'
import { ForecastQuestionController } from './forecast-question.controller'
import { forecastQuestionQuerySchema, importQuestionsSchema } from './forecast-question.validation'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .get(validateMiddleware(forecastQuestionQuerySchema), bindHandler(ForecastQuestionController, 'getList'))

router.route('/:id').get(validateMiddleware(idParamSchema), bindHandler(ForecastQuestionController, 'getDetails'))

router
  .route('/import')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(importQuestionsSchema),
    bindHandler(ForecastQuestionController, 'importQuestions')
  )

export const forecastQuestionRoutes = router
