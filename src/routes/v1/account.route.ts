import express from 'express'
import { accountController } from '~/controllers'
import { authMiddleware } from '~/middlewares'

const Router = express.Router()

Router.route('/').get(authMiddleware.hasPermission('PER_L'), authMiddleware.isAuthorized, accountController.getAll)

Router.route('/me').get(authMiddleware.isAuthorized, accountController.getMe)

export const accountRoutes = Router
