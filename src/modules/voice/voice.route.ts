import express from 'express'
import { validateMiddleware } from '~/common/middlewares'
import { createVoiceSchema, updateVoiceSchema } from './voice.validation'
import { idParamSchema } from '~/common/base/base.validation'
import { bindHandler } from '~/common/utils'
import { VoiceController } from './voice.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('VOICE:CREATE'),
    validateMiddleware(createVoiceSchema),
    bindHandler(VoiceController, 'createNew')
  )

router
  .route('/:id')
  .put(authMiddleware.isAuthorized, validateMiddleware(updateVoiceSchema), bindHandler(VoiceController, 'update'))

router
  .route('/activate/:id')
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('VOICE:ACTIVATE'),
    validateMiddleware(idParamSchema),
    bindHandler(VoiceController, 'activate')
  )

export const voiceRoutes = router
