import express from 'express'
import { bindHandler } from '~/common/utils'
import { PaymentController } from './payment.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { validateMiddleware } from '~/common/middlewares'
import { createPaymentSchema } from './payment.validation'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router.route('/webhook/payos').post(bindHandler(PaymentController, 'webhookPayOS'))

router
  .route('/')
  .post(authMiddleware.isAuthorized, validateMiddleware(createPaymentSchema), bindHandler(PaymentController, 'create'))

router
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(PaymentController, 'getDetails'))

export const paymentRoutes = router
