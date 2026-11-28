import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { forecastTopicQuerySchema } from './forecast-topic.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { ForecastTopicController } from './forecast-topic.controller'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

router.route('/').get(validateMiddleware(forecastTopicQuerySchema), bindHandler(ForecastTopicController, 'getList'))

router.route('/:id').get(validateMiddleware(idParamSchema), bindHandler(ForecastTopicController, 'getDetails'))

export const forecastTopicRoutes = router
