import express from 'express'
import { bindHandler } from '~/common/utils'
import { AccountController } from './account.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('ACCOUNT:VIEW:ALL'),
    bindHandler(AccountController, 'getList')
  )

router.route('/me').get(
  authMiddleware.isAuthorized,
  // authMiddleware.hasPermission('ACCOUNT:VIEW'),
  bindHandler(AccountController, 'getMe')
)

export const accountRoutes = router
