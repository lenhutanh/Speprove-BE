import express from 'express'
import { bindHandler } from '~/core/http/bind-handler'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { VoiceRoomController } from './voice-room.controller'
import {
  createVoiceRoomSchema,
  getActiveVoiceRoomsSchema,
  getVoiceRoomByIdSchema,
  joinVoiceRoomSchema,
  leaveVoiceRoomSchema,
  participantActionSchema,
  pinQuestionSchema,
  unpinQuestionSchema,
  updateVoiceRoomSchema
} from './voice-room.validation'

const router = express.Router()
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

router
  .route('/:id/transfer-host')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(participantActionSchema),
    bindHandler(VoiceRoomController, 'transferHost')
  )

router
  .route('/:id/mute-participant')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(participantActionSchema),
    bindHandler(VoiceRoomController, 'muteParticipant')
  )

router
  .route('/:id/unmute-participant')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(participantActionSchema),
    bindHandler(VoiceRoomController, 'unmuteParticipant')
  )

router
  .route('/:id/kick-participant')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(participantActionSchema),
    bindHandler(VoiceRoomController, 'kickParticipant')
  )

export const voiceRoomRoutes = router
