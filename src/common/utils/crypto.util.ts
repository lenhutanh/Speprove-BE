import crypto from 'node:crypto'

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString()
}

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}
