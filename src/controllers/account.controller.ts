import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { accountService } from '~/services/account.service'

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await accountService.getAll()
    res.status(StatusCodes.OK).json(new ApiResponse('Get account list successfully', accounts))
  } catch (error) {
    next(error)
  }
}

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await accountService.getMe(req.jwtDecoded._id)
    res.status(StatusCodes.OK).json(new ApiResponse('Get me successfully', account))
  } catch (error) {
    next(error)
  }
}

export const accountController = {
  getAll,
  getMe
}
