import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { permissionGroupService } from '~/services/permission-group.service'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionGroup = await permissionGroupService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created permission group successfully', permissionGroup))
  } catch (error) {
    next(error)
  }
}

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionGroups = await permissionGroupService.getAll()
    res.status(StatusCodes.OK).json(new ApiResponse('Get permission group list successfully', permissionGroups))
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionGroup = await permissionGroupService.getDetails(req.validated.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Get permission group details successfully', permissionGroup))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissionGroup = await permissionGroupService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated permission group successfully', permissionGroup))
  } catch (error) {
    next(error)
  }
}

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await permissionGroupService.remove(req.validated.params.id)
    res.status(StatusCodes.OK).json(new ApiResponse('Deleted permission group successfully'))
  } catch (error) {
    next(error)
  }
}

export const permissionGroupController = {
  createNew,
  getAll,
  getDetails,
  update,
  remove
}
