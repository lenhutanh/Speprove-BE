import express from 'express'
import { voiceController } from '~/controllers'
import { authMiddleware, validateMiddleware } from '~/middlewares'
import { createVoiceSchema, updateVoiceSchema } from '~/validations'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(createVoiceSchema),
  voiceController.createNew
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  validateMiddleware.validate(updateVoiceSchema),
  voiceController.update
)

export const voiceRoutes = Router
