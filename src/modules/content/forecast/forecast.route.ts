import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import {
  createForecastSchema,
  forecastQuerySchema,
  importTopicsSchema,
  importForecastSchema
} from './forecast.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { ForecastController } from './forecast.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

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
    validateMiddleware(forecastQuerySchema),
    bindHandler(ForecastController, 'getList')
  )

router
  .route('/import')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('FORECAST:CREATE'),
    validateMiddleware(importForecastSchema),
    bindHandler(ForecastController, 'importForecast')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorizedOptional,
    validateMiddleware(idParamSchema),
    bindHandler(ForecastController, 'getDetails')
  )

router
  .route('/:id/import-topics')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(importTopicsSchema),
    bindHandler(ForecastController, 'importTopics')
  )

export const forecastRoutes = router
