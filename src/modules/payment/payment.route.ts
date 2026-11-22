import express from 'express'
import { bindHandler } from '~/common/http'
import { PaymentController } from './payment.controller'
import { authMiddleware } from '~/common/middlewares/auth.middleware'
import { validateMiddleware } from '~/common/middlewares'
import { createPaymentSchema } from './payment.validation'
import { idParamSchema } from '~/common/base'

const router = express.Router()

router.route('/webhook/payos').post(bindHandler(PaymentController, 'webhookPayOS'))

router
  .route('/')
  .post(authMiddleware.isAuthorized, validateMiddleware(createPaymentSchema), bindHandler(PaymentController, 'create'))

router
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(PaymentController, 'getDetails'))

export const paymentRoutes = router
