import express from 'express'
import { container } from 'tsyringe'
import { bindHandler } from '~/common/http'
import { validateMiddleware } from '~/common/middlewares'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { VoiceRoomController } from './voice-room.controller'
import {
  createVoiceRoomSchema,
  getActiveVoiceRoomsSchema,
  getVoiceRoomByIdSchema,
  joinVoiceRoomSchema,
  leaveVoiceRoomSchema,
  pinQuestionSchema,
  unpinQuestionSchema,
  updateVoiceRoomSchema
} from './voice-room.validation'

const router = express.Router()
const authMiddleware = container.resolve(AuthMiddleware)

router.post(
  '/webhook',
  express.raw({ type: 'application/webhook+json' }),
  bindHandler(VoiceRoomController, 'handleWebhook')
)

router
  .route('/')
  .get(validateMiddleware(getActiveVoiceRoomsSchema), bindHandler(VoiceRoomController, 'getActiveRooms'))
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createVoiceRoomSchema),
    bindHandler(VoiceRoomController, 'createRoom')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorizedOptional,
    validateMiddleware(getVoiceRoomByIdSchema),
    bindHandler(VoiceRoomController, 'getRoomById')
  )
  .delete(
    authMiddleware.isAuthorized,
    validateMiddleware(getVoiceRoomByIdSchema),
    bindHandler(VoiceRoomController, 'closeRoom')
  )
  .patch(
    authMiddleware.isAuthorized,
    validateMiddleware(updateVoiceRoomSchema),
    bindHandler(VoiceRoomController, 'updateRoom')
  )

router
  .route('/:id/join')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(joinVoiceRoomSchema),
    bindHandler(VoiceRoomController, 'joinRoom')
  )

router
  .route('/:id/leave')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(leaveVoiceRoomSchema),
    bindHandler(VoiceRoomController, 'leaveRoom')
  )

router
  .route('/:id/pin-question')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(pinQuestionSchema),
    bindHandler(VoiceRoomController, 'pinQuestion')
  )
  .delete(
    authMiddleware.isAuthorized,
    validateMiddleware(unpinQuestionSchema),
    bindHandler(VoiceRoomController, 'unpinQuestion')
  )

export const voiceRoomRoutes = router
