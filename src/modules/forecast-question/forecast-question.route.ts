import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { bindHandler } from '~/common/utils'
import { ForecastQuestionController } from './forecast-question.controller'
import { getForecastQuestionSchema } from './forecast-question.validation'

const router = express.Router()

router.route('/').get(validateMiddleware(getForecastQuestionSchema), bindHandler(ForecastQuestionController, 'getList'))

router.route('/:id').get(bindHandler(ForecastQuestionController, 'getDetails'))

export const forecastQuestionRoutes = router
