import { Types } from 'mongoose'

export const toObjectId = (id: string) => new Types.ObjectId(id)

export const toObjectIds = (ids?: string[]): Types.ObjectId[] => {
  if (!ids) return []

  return ids.map(toObjectId).filter((id): id is Types.ObjectId => id !== undefined)
}
