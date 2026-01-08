import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { groupService } from '~/services/group.service'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created group successfully', group))
  } catch (error) {
    next(error)
  }
}

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await groupService.getAll()
    res.status(StatusCodes.OK).json(new ApiResponse('Get group list successfully', groups))
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Get group details successfully', group))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated group successfully', group))
  } catch (error) {
    next(error)
  }
}

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await groupService.remove(req.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Deleted group successfully'))
  } catch (error) {
    next(error)
  }
}

export const groupController = {
  createNew,
  getAll,
  getDetails,
  update,
  remove
}
