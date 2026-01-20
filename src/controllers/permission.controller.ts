import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { permissionService } from '~/services/permission.service'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await permissionService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created permission successfully', permission))
  } catch (error) {
    next(error)
  }
}

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await permissionService.getAll()
    res.status(StatusCodes.OK).json(new ApiResponse('Get permission list successfully', permissions))
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await permissionService.getDetails(req.validated.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Get permission details successfully', permission))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await permissionService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated permission successfully', permission))
  } catch (error) {
    next(error)
  }
}

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await permissionService.remove(req.validated.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Deleted permission successfully'))
  } catch (error) {
    next(error)
  }
}

export const permissionController = {
  createNew,
  getAll,
  getDetails,
  update,
  remove
}
