import express from 'express'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/http'
import { CreditPackageController } from './credit-package.controller'
import { validateMiddleware } from '~/common/middlewares'
import { createCreditPackageSchema } from './credit-package.validation'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createCreditPackageSchema),
    bindHandler(CreditPackageController, 'create')
  )
  .get(bindHandler(CreditPackageController, 'getAll'))

export const creditPackageRoutes = router
