import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { ForecastQuestionController } from './forecast-question.controller'
import { forecastQuestionQuerySchema, importQuestionsSchema } from './forecast-question.validation'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

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
