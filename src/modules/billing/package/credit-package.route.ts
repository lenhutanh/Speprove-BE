import express from 'express'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { CreditPackageController } from './credit-package.controller'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { createCreditPackageSchema } from './credit-package.validation'

const router = express.Router()

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createCreditPackageSchema),
    bindHandler(CreditPackageController, 'create')
  )
  .get(bindHandler(CreditPackageController, 'getAll'))

export const creditPackageRoutes = router
