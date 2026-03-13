import express from 'express'
import { authRoutes } from '../modules/auth/auth.route'
import { accountRoutes } from '../modules/account/account.route'
import { forecastRoutes } from '../modules/forecast/forecast.route'
import { groupRoutes } from '../modules/group/group.route'
import { permissionRoutes } from '../modules/permission/permission.route'
import { permissionGroupRoutes } from '../modules/permission-group/permission-group.route'
import { questionRoutes } from '../modules/question/question.route'
import { topicRoutes } from '../modules/topic/topic.route'
import { voiceRoutes } from '../modules/voice/voice.route'
import { fileRoutes } from '~/modules/file/file.route'

const router = express.Router()

router.use('/account', accountRoutes)
router.use('/auth', authRoutes)
router.use('/forecast', forecastRoutes)
router.use('/group', groupRoutes)
router.use('/permission', permissionRoutes)
router.use('/permission-group', permissionGroupRoutes)
router.use('/question', questionRoutes)
router.use('/topic', topicRoutes)
router.use('/voice', voiceRoutes)
router.use('/file', fileRoutes)

export const APIs_V1 = router
