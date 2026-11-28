import express from 'express'
import { bindHandler } from '~/core/http/bind-handler'
import { PaymentController } from './payment.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { createPaymentSchema } from './payment.validation'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

router.route('/webhook/payos').post(bindHandler(PaymentController, 'webhookPayOS'))

router
  .route('/')
  .post(authMiddleware.isAuthorized, validateMiddleware(createPaymentSchema), bindHandler(PaymentController, 'create'))

router
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(PaymentController, 'getDetails'))

export const paymentRoutes = router
