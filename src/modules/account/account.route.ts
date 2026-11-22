import express from 'express'
import { bindHandler } from '~/common/http'
import { AccountController } from './account.controller'
import { authMiddleware } from '~/common/middlewares/auth.middleware'
import { validateMiddleware } from '~/common/middlewares'
import { updateProfileSchema, updateSelectedVoiceSchema } from './account.validation'

const router = express.Router()

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

router.put(
  '/update-profile',
  authMiddleware.isAuthorized,
  validateMiddleware(updateProfileSchema),
  bindHandler(AccountController, 'updateProfile')
)

router
  .route('/select-voice')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(updateSelectedVoiceSchema),
    bindHandler(AccountController, 'updateSelectedVoice')
  )

export const accountRoutes = router
