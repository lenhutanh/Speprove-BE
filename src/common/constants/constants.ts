import { env } from '~/common/config/env.config'

export const ACCOUNT_KIND = {
  ADMIN: 1,
  USER: 2
} as const

export const TOKEN_TYPE = {
  ACCESS: 1,
  REFRESH: 2
} as const

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE]

export const STATUS = {
  ACTIVE: 1,
  PENDING: 0,
  PROCESSING: 2,

  LOCKED: -1,
  DELETED: -2,
  REJECTED: -3,
  FAILED: -4
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

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export const LIMIT_IMAGE_SIZE = 5 * 1024 * 1024
export const LIMIT_AUDIO_SIZE = 50 * 1024 * 1024
export const LIMIT_VIDEO_SIZE = 200 * 1024 * 1024

export const GENDER_KIND = {
  MALE: 0,
  FEMALE: 1
} as const

export const ENGLISH_LOCALES = {
  US: 'en-US',
  GB: 'en-GB',
  AU: 'en-AU',
  CA: 'en-CA',
  IN: 'en-IN'
} as const

export type EnglishLocale = (typeof ENGLISH_LOCALES)[keyof typeof ENGLISH_LOCALES]

export const VOICES = [
  'en-US-AriaNeural', // hơi chậm
  'en-US-GuyNeural' // ok
  // 'en-GB-RyanNeural', // nhanh
  // 'en-GB-LibbyNeural', // ok
  // 'en-AU-WilliamNeural', // hơi nhanh
  // 'en-AU-NatashaNeural' // hơi chậm
] as const

export const CLOUD_FOLDERS = {
  AVATARS: `${env.APP_NAME}/users/avatars`,
  VOICE_SAMPLES: `${env.APP_NAME}/voices/samples`,
  QUESTION_AUDIOS: `${env.APP_NAME}/questions/audios`,
  USER_RECORDINGS: `${env.APP_NAME}/practice/recordings`,
  FORECAST_THUMBNAIL: `${env.APP_NAME}/forecasts/thumbnails`
} as const

export const FILE_KIND = {
  AUDIO: 'audio',
  IMAGE: 'image'
} as const

export type FileKind = (typeof FILE_KIND)[keyof typeof FILE_KIND]

export const STORAGE_PROVIDER = {
  CLOUDINARY: 'cloudinary'
} as const

export type StorageProvider = (typeof STORAGE_PROVIDER)[keyof typeof STORAGE_PROVIDER]

export const AUDIO_MIME_TYPES = {
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  M4A: 'audio/x-m4a',
  WEBM: 'audio/webm'
} as const

export const PART23_CATEGORY = {
  PERSON: 'Person',
  PLACE: 'Place',
  OBJECT: 'Object',
  ACTIVITY: 'Activity',
  EVENT_EXPERIENCE: 'Event/Experience'
} as const

export type Part23CategoryValue = (typeof PART23_CATEGORY)[keyof typeof PART23_CATEGORY]

export const PartKind = {
  ONE: 1,
  TWO: 2,
  THREE: 3
} as const

export const IMAGE_PURPOSE = {
  AVATAR: 'user/avatar',
  FORECAST_THUMBNAIL: 'forecast/thumbnail'
} as const

export type ImagePurpose = (typeof IMAGE_PURPOSE)[keyof typeof IMAGE_PURPOSE]

export const AUDIO_PURPOSE = {
  QUESTION_AUDIO: 'question/audio'
} as const

export type AudioPurpose = (typeof AUDIO_PURPOSE)[keyof typeof AUDIO_PURPOSE]

export const PURPOSE_TO_FOLDER: Record<ImagePurpose | AudioPurpose, string> = {
  // Image
  [IMAGE_PURPOSE.AVATAR]: CLOUD_FOLDERS.AVATARS,
  [IMAGE_PURPOSE.FORECAST_THUMBNAIL]: CLOUD_FOLDERS.FORECAST_THUMBNAIL,

  // Audio
  [AUDIO_PURPOSE.QUESTION_AUDIO]: CLOUD_FOLDERS.QUESTION_AUDIOS
}
