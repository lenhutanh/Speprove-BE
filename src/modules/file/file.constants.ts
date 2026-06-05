import { CLOUD_FOLDERS } from '~/infrastructure/providers/storage/storage.constants'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/ogg',
  'audio/webm',
  'video/webm',
  'video/mp4'
]

export const LIMIT_IMAGE_SIZE = 5 * 1024 * 1024
export const LIMIT_AUDIO_SIZE = 50 * 1024 * 1024

export const FILE_KIND = {
  AUDIO: 'audio',
  IMAGE: 'image'
} as const

export type FileKind = (typeof FILE_KIND)[keyof typeof FILE_KIND]

export const AUDIO_MIME_TYPES = {
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  M4A: 'audio/x-m4a',
  WEBM: 'audio/webm'
} as const

export const IMAGE_PURPOSE = {
  AVATAR: 'user/avatar',
  FORECAST_THUMBNAIL: 'forecast/thumbnail'
} as const

export type ImagePurpose = (typeof IMAGE_PURPOSE)[keyof typeof IMAGE_PURPOSE]

export const AUDIO_PURPOSE = {
  PRACTICE: 'practice',
  MOCK_TEST: 'mock'
} as const

export type AudioPurpose = (typeof AUDIO_PURPOSE)[keyof typeof AUDIO_PURPOSE]

export const PURPOSE_TO_FOLDER: Record<ImagePurpose | AudioPurpose, string> = {
  [IMAGE_PURPOSE.AVATAR]: CLOUD_FOLDERS.AVATARS,
  [IMAGE_PURPOSE.FORECAST_THUMBNAIL]: CLOUD_FOLDERS.FORECAST_THUMBNAIL,
  [AUDIO_PURPOSE.PRACTICE]: CLOUD_FOLDERS.PRACTICE,
  [AUDIO_PURPOSE.MOCK_TEST]: CLOUD_FOLDERS.MOCK_TEST
}
