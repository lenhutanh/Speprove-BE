import express from 'express'
import { container } from 'tsyringe'
import { FileController } from './file.controller'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { multerMiddleware, validateMiddleware } from '~/common/middlewares'
import { validateFileContent } from '~/common/middlewares/multer.middleware'
import { bindHandler } from '~/common/utils'
import { uploadAudioSchema, uploadImageSchema } from './file.validation'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/upload/image')
  .post(
    authMiddleware.isAuthorized,
    multerMiddleware.uploadImage,
    validateMiddleware(uploadImageSchema),
    validateFileContent.image,
    bindHandler(FileController, 'uploadImage')
  )

router
  .route('/upload/audio')
  .post(
    authMiddleware.isAuthorized,
    multerMiddleware.uploadAudio,
    validateMiddleware(uploadAudioSchema),
    validateFileContent.audio,
    bindHandler(FileController, 'uploadAudio')
)

export const fileRoutes = router
