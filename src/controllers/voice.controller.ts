import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { voiceService } from '~/services'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voice = await voiceService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created voice successfully', voice))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voice = await voiceService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated voice successfully', voice))
  } catch (error) {
    next(error)
  }
}

export const voiceController = {
  createNew,
  update
}
