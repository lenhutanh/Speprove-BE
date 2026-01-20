import express from 'express'
import { authController } from '~/controllers/auth.controller'
import { validateMiddleware } from '~/middlewares/validate.middleware'
import { loginSchema, registerSchema, verifySchema } from '~/validations'

const Router = express.Router()

Router.post('/register', validateMiddleware.validate(registerSchema), authController.register)
Router.post('/login', validateMiddleware.validate(loginSchema), authController.login)
Router.post('/verify-otp', validateMiddleware.validate(verifySchema), authController.verify)
Router.post('/refresh', authController.refreshToken)
Router.post('/logout', authController.logout)

export const authRoutes = Router
