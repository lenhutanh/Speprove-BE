import { Types } from 'mongoose'
import { AppError } from '../errors/app.error'
import { StatusCodes } from 'http-status-codes'

export const toObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ObjectId: ${id}`, StatusCodes.BAD_REQUEST)
  }

  return new Types.ObjectId(id)
}

export const toObjectIds = (ids?: string[]) => {
  if (!ids) return []

  return ids.map(toObjectId)
}
