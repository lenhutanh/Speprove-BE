import { NextFunction, RequestHandler, Response } from 'express'
import { container, InjectionToken } from 'tsyringe'
import { asyncHandler } from './async-handler'
import { AppError } from '../errors/app.error'
import { StatusCodes } from 'http-status-codes'

type ControllerMethod = (req: any, res: Response, next: NextFunction) => Promise<any>

export const bindHandler = <T>(
  controllerToken: InjectionToken<T>,
  methodName: { [K in keyof T]: T[K] extends ControllerMethod ? K : never }[keyof T]
): RequestHandler => {
  return asyncHandler(async (req, res, next) => {
    const controller = container.resolve(controllerToken)

    const method = controller[methodName] as unknown as ControllerMethod

    if (typeof method !== 'function') {
      throw new AppError(`Method ${String(methodName)} is not defined in controller`, StatusCodes.INTERNAL_SERVER_ERROR)
    }

    return await method.call(controller, req, res, next)
  })
}
