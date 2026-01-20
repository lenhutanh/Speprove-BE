import express from 'express'
import { forecastController } from '~/controllers/forecast.controller'
import { authMiddleware, validateMiddleware } from '~/middlewares'
import { createForecastSchema, getForecastsSchema, updateForecastSchema } from '~/validations'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, validateMiddleware.validate(createForecastSchema), forecastController.createNew)
  .get(validateMiddleware.validate(getForecastsSchema), forecastController.getList)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(updateForecastSchema),
  forecastController.update
)

export const forecastRoutes = Router
