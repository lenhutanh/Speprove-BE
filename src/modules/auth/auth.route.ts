import express from 'express'
import { AuthController } from '~/modules/auth/auth.controller'
import { validateMiddleware } from '~/common/middlewares/validate.middleware'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleCallbackSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  setPasswordSchema,
  verifySchema
} from './auth.validation'
import { bindHandler } from '~/common/http'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { rateLimitMiddleware } from '~/infrastructure/rate-limiter/rate-limiter.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router.post(
  '/login',
  rateLimitMiddleware(3, 10000, 'auth:login', true),
  validateMiddleware(loginSchema),
  bindHandler(AuthController, 'login')
)
router.post('/register', validateMiddleware(registerSchema), bindHandler(AuthController, 'register'))
router.post('/verify-register', validateMiddleware(verifySchema), bindHandler(AuthController, 'verifyRegister'))
router.post('/refresh', rateLimitMiddleware(10, 10000, 'auth:refresh'), bindHandler(AuthController, 'refreshToken'))
router.post('/logout', authMiddleware.isAuthorizedOptional, bindHandler(AuthController, 'logout'))
router.post('/forgot-password', validateMiddleware(forgotPasswordSchema), bindHandler(AuthController, 'forgotPassword'))
router.post(
  '/verify-forgot-password',
  validateMiddleware(verifySchema),
  bindHandler(AuthController, 'verifyForgotPassword')
)
router.post('/reset-password', validateMiddleware(resetPasswordSchema), bindHandler(AuthController, 'resetPassword'))

router.get('/google', bindHandler(AuthController, 'googleLogin'))

router.get('/google/callback', validateMiddleware(googleCallbackSchema), bindHandler(AuthController, 'googleCallback'))

router.put(
  '/change-password',
  authMiddleware.isAuthorized,
  validateMiddleware(changePasswordSchema),
  bindHandler(AuthController, 'changePassword')
)

router.put(
  '/set-password',
  authMiddleware.isAuthorized,
  validateMiddleware(setPasswordSchema),
  bindHandler(AuthController, 'setPassword')
)

export const authRoutes = router
