import express from 'express'
import { bindHandler } from '~/core/http/bind-handler'
import { AccountController } from './account.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { updateProfileSchema, updateSelectedVoiceSchema } from './account.validation'

const router = express.Router()

router
  .route('/')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('ACCOUNT:VIEW:ALL'),
    bindHandler(AccountController, 'getList')
  )

router.route('/me').get(authMiddleware.isAuthorized, bindHandler(AccountController, 'getMe'))

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
