import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { questionService } from '~/services'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created question successfully', question))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated question successfully', question))
  } catch (error) {
    next(error)
  }
}

export const questionController = {
  createNew,
  update
}
