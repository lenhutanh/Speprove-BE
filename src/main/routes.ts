import express from 'express'
import { authRoutes } from '../modules/auth/auth.route'
import { accountRoutes } from '../modules/account/account.route'
import { forecastRoutes } from '../modules/content/forecast/forecast.route'
import { groupRoutes } from '../modules/account/group/group.route'
import { permissionRoutes } from '../modules/account/permission/permission.route'
import { permissionGroupRoutes } from '../modules/account/permission-group/permission-group.route'
import { questionRoutes } from '../modules/content/question/question.route'
import { topicRoutes } from '../modules/content/topic/topic.route'
import { voiceRoutes } from '../modules/content/voice/voice.route'
import { fileRoutes } from '~/modules/file/file.route'
import { forecastTopicRoutes } from '~/modules/content/forecast-topic/forecast-topic.route'
import { forecastQuestionRoutes } from '~/modules/content/forecast-question/forecast-question.route'
import { speakingSessionRoutes } from '~/modules/practice/mock-test/speaking-session.route'
import { attemptRoutes } from '~/modules/practice/attempt/attempt.route'
import { paymentRoutes } from '~/modules/billing/payment/payment.route'
import { creditPackageRoutes } from '~/modules/billing/package/credit-package.route'
import { vocabularySuggestionRoutes } from '~/modules/content/vocabulary/vocabulary-suggestion.route'
import { creditLogRoutes } from '~/modules/billing/wallet/credit-log.route'
import { voiceRoomRoutes } from '~/modules/voice-room/voice-room.route'

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
router.use('/speaking-session', speakingSessionRoutes)
router.use('/attempt', attemptRoutes)
router.use('/payment', paymentRoutes)
router.use('/credit-package', creditPackageRoutes)
router.use('/vocabulary-suggestion', vocabularySuggestionRoutes)
router.use('/credit-log', creditLogRoutes)
router.use('/voice-room', voiceRoomRoutes)

export const APIs_V1 = router
