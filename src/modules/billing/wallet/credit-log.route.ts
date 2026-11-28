import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { getListCreditLogSchema } from './credit-log.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { CreditLogController } from './credit-log.controller'

const router = express.Router()

router
  .route('/')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(getListCreditLogSchema),
    bindHandler(CreditLogController, 'getList')
  )

export const creditLogRoutes = router
