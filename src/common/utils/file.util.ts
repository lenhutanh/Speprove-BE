import { randomBytes } from 'crypto'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import axios from 'axios'

export const generateFileName = (originalName: string) => {
  const ext = path.extname(originalName).toLowerCase()
  const random = randomBytes(8).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${random}${ext}`
}

export const downloadToTemp = async (url: string, prefix = 'tmp-'): Promise<string> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  const tmpPath = path.join(os.tmpdir(), `${prefix}${Date.now()}.wav`)
  fs.writeFileSync(tmpPath, response.data)
  return tmpPath
}
