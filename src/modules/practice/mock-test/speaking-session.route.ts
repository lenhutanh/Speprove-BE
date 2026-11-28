import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { createSpeakingSessionSchema, speakingSessionQuerySchema } from './speaking-session.validation'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { SpeakingSessionController } from './speaking-session.controller'
import { idParamSchema } from '~/core/persistence/base.validation'

const router = express.Router()

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createSpeakingSessionSchema),
    bindHandler(SpeakingSessionController, 'createNew')
  )
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(speakingSessionQuerySchema),
    bindHandler(SpeakingSessionController, 'getList')
  )

router
  .route('/active-session')
  .get(authMiddleware.isAuthorized, bindHandler(SpeakingSessionController, 'getActiveSession'))

router
  .route('/:id/current-question')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(SpeakingSessionController, 'getCurrentQuestion')
  )

router
  .route('/:id/retry')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(SpeakingSessionController, 'retrySession')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(SpeakingSessionController, 'getDetails')
  )

export const speakingSessionRoutes = router
