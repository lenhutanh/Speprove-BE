import { env } from '~/common/config'

export const CLOUD_FOLDERS = {
  AVATARS: `${env.APP_NAME}/users/avatars`,
  VOICE_SAMPLES: `${env.APP_NAME}/voices/samples`,
  GENERATED_AUDIOS: `${env.APP_NAME}/generated-audios`,
  PRACTICE: `${env.APP_NAME}/practice/recordings`,
  FORECAST_THUMBNAIL: `${env.APP_NAME}/forecasts/thumbnails`,
  MOCK_TEST: `${env.APP_NAME}/mock/recordings`
} as const

export const STORAGE_PROVIDER = {
  CLOUDINARY: 'cloudinary'
} as const

export type StorageProvider = (typeof STORAGE_PROVIDER)[keyof typeof STORAGE_PROVIDER]

export enum UploadPreset {
  IMAGE_DEFAULT = 'IMAGE_DEFAULT',
  AUDIO_AI = 'AUDIO_AI',
  AUDIO_PLAYBACK = 'AUDIO_PLAYBACK'
}

export type UploadConfig = {
  resource_type: 'image' | 'video' | 'raw'
  format?: string
  transformation?: any[]
}

export const UPLOAD_PRESET_MAP: Record<UploadPreset, UploadConfig> = {
  [UploadPreset.IMAGE_DEFAULT]: {
    resource_type: 'image',
    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
  },

  [UploadPreset.AUDIO_AI]: {
    resource_type: 'raw',
    format: 'wav'
  },

  [UploadPreset.AUDIO_PLAYBACK]: {
    resource_type: 'video',
    format: 'mp3'
  }
}
