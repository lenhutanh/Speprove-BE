import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createForecastSchema, forecastQuerySchema, importTopicsSchema } from './forecast.validation'
import { bindHandler } from '~/common/http'
import { ForecastController } from './forecast.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('FORECAST:CREATE'),
    validateMiddleware(createForecastSchema),
    bindHandler(ForecastController, 'createNew')
  )
  .get(
    authMiddleware.isAuthorizedOptional,
    // authMiddleware.hasPermission('FORECAST:VIEW:ALL'),
    validateMiddleware(forecastQuerySchema),
    bindHandler(ForecastController, 'getList')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorizedOptional,
    validateMiddleware(idParamSchema),
    bindHandler(ForecastController, 'getDetails')
  )
// .put(
//   authMiddleware.isAuthorized,
//   authMiddleware.hasPermission('FORECAST:UPDATE'),
//   validateMiddleware(updateForecastSchema),
//   bindHandler(ForecastController, 'update')
// )

router.route('/:id/import-topics').post(
  authMiddleware.isAuthorized,
  // authMiddleware.hasPermission('FORECAST_TOPIC:CREATE'),
  validateMiddleware(importTopicsSchema),
  bindHandler(ForecastController, 'importTopics')
)

export const forecastRoutes = router
