import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { authMiddleware } from '~/common/middlewares/auth.middleware'
import { getListCreditLogSchema } from './credit-log.validation'
import { bindHandler } from '~/common/http'
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
