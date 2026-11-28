import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { AttemptController } from './attempt.controller'
import {
  attemptQuerySchema,
  createAttemptSchema,
  getLeaderboardSchema,
  getWordAudioSchema,
  shareAttemptSchema
} from './attempt.validation'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createAttemptSchema),
    bindHandler(AttemptController, 'createNew')
  )
  .get(authMiddleware.isAuthorized, validateMiddleware(attemptQuerySchema), bindHandler(AttemptController, 'getList'))

router
  .route('/leaderboard')
  .get(validateMiddleware(getLeaderboardSchema), bindHandler(AttemptController, 'getLeaderboard'))

router
  .route('/:id/share')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(shareAttemptSchema),
    bindHandler(AttemptController, 'toggleShare')
  )

router
  .route('/:id/word-audio')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(getWordAudioSchema),
    bindHandler(AttemptController, 'getWordAudio')
  )

router
  .route('/:id/retry')
  .post(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(AttemptController, 'retryAttempt'))

router
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(AttemptController, 'getDetails'))

export const attemptRoutes = router
