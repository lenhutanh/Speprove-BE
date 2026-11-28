import express from 'express'
import { FileController } from './file.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { fileUploadMiddleware, validateFileContent } from './file.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { uploadAudioSchema, uploadImageSchema } from './file.validation'

const router = express.Router()

router
  .route('/upload-image')
  .post(
    authMiddleware.isAuthorized,
    fileUploadMiddleware.uploadImage,
    validateMiddleware(uploadImageSchema),
    validateFileContent.image,
    bindHandler(FileController, 'uploadImage')
  )

router
  .route('/upload-audio')
  .post(
    authMiddleware.isAuthorized,
    fileUploadMiddleware.uploadAudio,
    validateMiddleware(uploadAudioSchema),
    validateFileContent.audio,
    bindHandler(FileController, 'uploadAudio')
  )

export const fileRoutes = router
