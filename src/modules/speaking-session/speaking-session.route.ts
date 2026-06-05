import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createSpeakingSessionSchema, speakingSessionQuerySchema } from './speaking-session.validation'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/http'
import { SpeakingSessionController } from './speaking-session.controller'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

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
  .route('/:id')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(SpeakingSessionController, 'getDetails')
  )

export const speakingSessionRoutes = router
