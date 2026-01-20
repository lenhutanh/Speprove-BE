import { Model } from 'mongoose'
import slugify from 'slugify'

export const generateUniqueSlug = async <T>(model: Model<T>, name: string, field: string = 'slug'): Promise<string> => {
  const baseSlug = slugify(name, { lower: true, strict: true })

  const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`^${escaped}(-\\d+)?$`, 'i')

  const existingDocs = await model
    .find({ [field]: regex })
    .select(field)
    .lean()

  if (!existingDocs.length) return baseSlug

  const maxSuffix = existingDocs.reduce((max, doc) => {
    const value = (doc as any)[field]
    const match = value.match(/-(\d+)$/)
    return Math.max(max, match ? Number(match[1]) : 0)
  }, 0)

  return `${baseSlug}-${maxSuffix + 1}`
}
