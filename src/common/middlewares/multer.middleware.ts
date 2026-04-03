import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors'
import { ALLOWED_AUDIO_TYPES, ALLOWED_IMAGE_TYPES, LIMIT_AUDIO_SIZE, LIMIT_IMAGE_SIZE } from '../constants/constants'
import { fileTypeFromBuffer } from 'file-type'

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.webm']

const createUploadMiddleware = (
  fieldName: string, // key mong muốn
  allowedTypes: string[],
  allowedExtensions: string[],
  limitSize: number
) => {
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: limitSize },
    fileFilter(_req: Request, file: Express.Multer.File, callback: any) {
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new AppError('File type is invalid.', StatusCodes.UNPROCESSABLE_ENTITY), false)
      }
      const ext = path.extname(file.originalname).toLowerCase()
      if (!allowedExtensions.includes(ext)) {
        return callback(new AppError('File extension is mismatch.', StatusCodes.UNPROCESSABLE_ENTITY), false)
      }
      callback(null, true)
    }
  })

  return (req: Request, res: Response, next: NextFunction) => {
    multerInstance.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`File key is invalid`, StatusCodes.BAD_REQUEST))
        }
        return next(err)
      }

      if (!req.file) {
        return next(new AppError(`File is required`, StatusCodes.BAD_REQUEST))
      }

      next()
    })
  }
}

const createValidateFileContent = (allowedTypes: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file?.buffer) return next()

    const detected = await fileTypeFromBuffer(req.file.buffer as any)
    console.log('🚀 ~ createValidateFileContent ~ detected:', detected)

    if (!detected || !allowedTypes.includes(detected.mime)) {
      return next(new AppError('File content is invalid!', StatusCodes.UNPROCESSABLE_ENTITY))
    }

    next()
  }
}

export const multerMiddleware = {
  uploadImage: createUploadMiddleware('image', ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, LIMIT_IMAGE_SIZE),
  uploadAudio: createUploadMiddleware('audio', ALLOWED_AUDIO_TYPES, ALLOWED_AUDIO_EXTENSIONS, LIMIT_AUDIO_SIZE)
}

export const validateFileContent = {
  image: createValidateFileContent(ALLOWED_IMAGE_TYPES),
  audio: createValidateFileContent(ALLOWED_AUDIO_TYPES)
}
