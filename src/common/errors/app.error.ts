import { StatusCodes } from 'http-status-codes'
import { ErrorCodes } from '../constants/error-codes'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public errorCode: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    public errors?: any,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}
