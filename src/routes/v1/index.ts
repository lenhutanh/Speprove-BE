import express from 'express'
import { accountRoutes } from './account.route'
import { groupRoutes } from './group.route'
import { permissionRoutes } from './permission.route'
import { authRoutes } from './auth.route'
import { permissionGroupRoutes } from './permission-group.route'
import { voiceRoutes } from './voice.route'
import { questionRoutes } from './question.route'
import { topicRoutes } from './topic.route'
import { forecastRoutes } from './forecast.route'

const Router = express.Router()

Router.use('/account', accountRoutes)
Router.use('/auth', authRoutes)
Router.use('/group', groupRoutes)
Router.use('/permission-group', permissionGroupRoutes)
Router.use('/permission', permissionRoutes)
Router.use('/voice', voiceRoutes)
Router.use('/question', questionRoutes)
Router.use('/topic', topicRoutes)
Router.use('/forecast', forecastRoutes)

export const APIs_V1 = Router
