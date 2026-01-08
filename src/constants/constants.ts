export const ACCOUNT_KIND = {
  ADMIN: 1,
  USER: 2
} as const

export const TOKEN_TYPE = {
  ACCESS: 1,
  REFRESH: 2
} as const

export const STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  LOCKED: -1,
  DELETED: -2
} as const

export const GROUP_KIND = {
  ADMIN: 1,
  USER: 2
} as const

export const GROUP_NAME: Record<keyof typeof GROUP_KIND, string> = {
  ADMIN: 'Admin',
  USER: 'User'
}

export const ACCOUNT_PLANS = {
  FREE: 'FREE',
  PLUS: 'PLUS',
  PRO: 'PRO'
} as const

export const WHITELIST_DOMAINS = ['http://localhost:3000']

export const ALLOW_COMMON_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'audio/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a'
]

export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.mp3', '.webm', '.wav']

export const GENDER_KIND = {
  MALE: 0,
  FEMALE: 1
} as const
