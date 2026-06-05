import express from 'express'
import { container } from 'tsyringe'
import { validateMiddleware } from '~/common/middlewares'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/http'
import { AttemptController } from './attempt.controller'
import {
  attemptQuerySchema,
  createAttemptSchema,
  getLeaderboardSchema,
  getWordAudioSchema,
  shareAttemptSchema
} from './attempt.validation'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

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
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(AttemptController, 'getDetails'))

export const attemptRoutes = router
