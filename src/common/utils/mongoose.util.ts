import { Types } from 'mongoose'

export const toObjectId = (id: string) => new Types.ObjectId(id)

export const toObjectIds = (ids?: string[]): Types.ObjectId[] => {
  if (!ids) return []

  return ids.map(toObjectId).filter((id): id is Types.ObjectId => id !== undefined)
}

export function isPopulated<T extends object, K extends keyof T>(
  field: T[K],
  key: string
): field is Extract<T[K], object> {
  return !!field && typeof field === 'object' && key in field
}
