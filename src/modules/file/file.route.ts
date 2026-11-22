import express from 'express'
import { FileController } from './file.controller'
import { authMiddleware } from '~/common/middlewares/auth.middleware'
import { validateMiddleware } from '~/common/middlewares'
import { fileUploadMiddleware, validateFileContent } from './file.middleware'
import { bindHandler } from '~/common/http'
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
