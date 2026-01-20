import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { topicService } from '~/services'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created topic successfully', topic))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated topic successfully', topic))
  } catch (error) {
    next(error)
  }
}

export const topicController = {
  createNew,
  update
}
