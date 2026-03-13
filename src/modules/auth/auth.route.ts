import express from 'express'
import { AuthController } from '~/modules/auth/auth.controller'
import { validateMiddleware } from '~/common/middlewares/validate.middleware'
import { loginSchema, registerSchema, verifySchema } from './auth.validation'
import { bindHandler } from '~/common/utils'
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
router.post('/verify', validateMiddleware(verifySchema), bindHandler(AuthController, 'verify'))
router.post('/refresh', bindHandler(AuthController, 'refreshToken'))
router.post('/logout', authMiddleware.isAuthorized, bindHandler(AuthController, 'logout'))

export const authRoutes = router
