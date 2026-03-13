import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '../types'

export class ResponseTransformer {
  static success<T>(
    res: Response,
    data?: T,
    message = 'Success',
    statusCode: number = StatusCodes.OK
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    })
  }

  static successNoData(
    res: Response,
    message = 'Action successful',
    statusCode: number = StatusCodes.OK
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: true,
      message
    })
  }

  static paginate<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    },
    message = 'Get list successfully'
  ): Response<ApiResponse<T[]>> {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      meta: pagination
    })
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    errors?: any
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      errorCode,
      errors
    })
  }
}
