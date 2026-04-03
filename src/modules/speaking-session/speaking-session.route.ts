import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createSpeakingSessionSchema } from './speaking-session.validation'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/utils'
import { SpeakingSessionController } from './speaking-session.controller'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createSpeakingSessionSchema),
    bindHandler(SpeakingSessionController, 'createNew')
  )

export const speakingSessionRoutes = router
