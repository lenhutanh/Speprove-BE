import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { bindHandler } from '~/common/utils'
import { ForecastQuestionController } from './forecast-question.controller'
import { forecastQuestionQuerySchema, getForecastQuestionDetailQuerySchema } from './forecast-question.validation'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .get(validateMiddleware(forecastQuestionQuerySchema), bindHandler(ForecastQuestionController, 'getList'))

router
  .route('/:id')
  .get(validateMiddleware(getForecastQuestionDetailQuerySchema), bindHandler(ForecastQuestionController, 'getDetails'))

export const forecastQuestionRoutes = router
