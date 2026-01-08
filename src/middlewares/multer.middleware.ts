import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, ALLOWED_EXTENSIONS, LIMIT_COMMON_FILE_SIZE } from '~/constants/constants'
import path from 'path'

import { ApiError } from '~/utils/api-error'
import { Request } from 'express'

const customFileFilter = (req: Request, file: Express.Multer.File, callback: any) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'File type is invalid!'), false)
  }

  const fileExtension = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'File extension is mismatch!'), false)
  }

  callback(null, true)
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerMiddleware = { upload }
