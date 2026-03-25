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
import { forecastTopicRoutes } from '~/modules/forecast-topic/forecast-topic.route'
import { forecastQuestionRoutes } from '~/modules/forecast-question/forecast-question.route'

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
router.use('/forecast-topic', forecastTopicRoutes)
router.use('/forecast-question', forecastQuestionRoutes)

export const APIs_V1 = router
