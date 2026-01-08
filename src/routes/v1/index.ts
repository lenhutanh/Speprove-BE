import express from 'express'
import { accountRoutes } from './account.route'
import { groupRoutes } from './group.route'
import { permissionRoutes } from './permission.route'
import { authRoutes } from './auth.route'
import { permissionGroupRoutes } from './permission-group.route'

const Router = express.Router()

Router.use('/account', accountRoutes)
Router.use('/auth', authRoutes)
Router.use('/group', groupRoutes)
Router.use('/permission-group', permissionGroupRoutes)
Router.use('/permission', permissionRoutes)

export const APIs_V1 = Router
