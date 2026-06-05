import { randomBytes } from 'crypto'
import path from 'path'

export const generateFileName = (originalName: string) => {
  const ext = path.extname(originalName).toLowerCase()
  const random = randomBytes(8).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${random}${ext}`
}
