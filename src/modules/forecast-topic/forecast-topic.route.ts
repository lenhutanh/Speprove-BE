import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { forecastTopicQuerySchema } from './forecast-topic.validation'
import { bindHandler } from '~/common/http'
import { ForecastTopicController } from './forecast-topic.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router.route('/').get(validateMiddleware(forecastTopicQuerySchema), bindHandler(ForecastTopicController, 'getList'))

router.route('/:id').get(validateMiddleware(idParamSchema), bindHandler(ForecastTopicController, 'getDetails'))

export const forecastTopicRoutes = router
