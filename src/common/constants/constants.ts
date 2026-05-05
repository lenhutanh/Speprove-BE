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
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/ogg',
  'audio/webm',
  'video/webm',
  'video/mp4'
]
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

export const PART2_CATEGORY = {
  OBJECT: 'Object',
  PERSON: 'Person',
  EVENT: 'Event',
  ACTIVITY: 'Activity',
  PLACE: 'Place',
  FAVOURITE: 'Favourite'
} as const

export type Part23CategoryValue = (typeof PART2_CATEGORY)[keyof typeof PART2_CATEGORY]

export const PART_KIND = {
  ONE: 1,
  TWO: 2,
  THREE: 3
} as const

export type PartKind = (typeof PART_KIND)[keyof typeof PART_KIND]

export const IMAGE_PURPOSE = {
  AVATAR: 'user/avatar',
  FORECAST_THUMBNAIL: 'forecast/thumbnail'
} as const

export type ImagePurpose = (typeof IMAGE_PURPOSE)[keyof typeof IMAGE_PURPOSE]

export const AUDIO_PURPOSE = {
  QUESTION_AUDIO: 'question/audio',
  USER_RECORDINGS: 'practice/recordings'
} as const

export type AudioPurpose = (typeof AUDIO_PURPOSE)[keyof typeof AUDIO_PURPOSE]

export const PURPOSE_TO_FOLDER: Record<ImagePurpose | AudioPurpose, string> = {
  // Image
  [IMAGE_PURPOSE.AVATAR]: CLOUD_FOLDERS.AVATARS,
  [IMAGE_PURPOSE.FORECAST_THUMBNAIL]: CLOUD_FOLDERS.FORECAST_THUMBNAIL,

  // Audio
  [AUDIO_PURPOSE.QUESTION_AUDIO]: CLOUD_FOLDERS.QUESTION_AUDIOS,
  [AUDIO_PURPOSE.USER_RECORDINGS]: CLOUD_FOLDERS.USER_RECORDINGS
}

export const SPEAKING_SESSION_MODE = {
  PRACTICE: 'practice',
  MOCK: 'mock'
} as const

export const SPEAKING_PART = [1, 2, 3] as const

export const SESSION_STATUS = {
  IN_PROGRESS: 0,
  COMPLETED: 1,
  FAILED: 2
} as const

export const ATTEMPT_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  DONE: 2,
  FAILED: 3
} as const

export type AttemptStatus = (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS]

export const AZURE_TICKS_PER_MS = 10_000
export const AZURE_TICKS_PER_SECOND = 10_000_000
export const MS_PER_SECOND = 1_000
export const SECONDS_PER_MINUTE = 60

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

export const SPEAKING_SESSION_TYPE = {
  MOCK_PART_1: 'mock_p1',
  MOCK_PART_2: 'mock_p2',
  MOCK_PART_3: 'mock_p3',
  FULL_TEST: 'full_test'
} as const

export const CREDIT_LOG_REF_TYPE = {
  PAYMENT: 'payment',
  USAGE: 'usage',
  MANUAL: 'manual'
} as const

export type CreditLogRefType = (typeof CREDIT_LOG_REF_TYPE)[keyof typeof CREDIT_LOG_REF_TYPE]

export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer'
} as const

export const PAYMENT_PROVIDER = {
  PAYOS: 'payos'
} as const

export const METHOD_TO_PROVIDER: Record<string, string> = {
  [PAYMENT_METHOD.BANK_TRANSFER]: PAYMENT_PROVIDER.PAYOS
}

export type PaymentProviderType = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER]

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELED: 'canceled',
  EXPIRED: 'expired'
} as const

export type PaymentStatusType = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const BUFFER_TIME = 3 * 60 * 1000
export const EXPIRED_DURATION = 15 * 60

export const CREDIT_COST = {
  PRACTICE: {
    PART_1: 1,
    PART_2: 2,
    PART_3: 2
  },
  MOCK: {
    PART_1: 3,
    PART_2: 5,
    PART_3: 5
  },
  FULL_TEST: 10
} as const

export const INSTRUCTION_KEYS = {
  PART1_INTRO: 'part1Intro',
  NEW_TOPIC: 'newTopic',
  PART2_INTRO: 'part2Intro',
  PREP_TIME: 'prepTime',
  PART3_INTRO: 'part3Intro',
  WELL_DONE: 'wellDone'
} as const

export type InstructionKey = (typeof INSTRUCTION_KEYS)[keyof typeof INSTRUCTION_KEYS]

export const INSTRUCTION_SCRIPTS = {
  part1Intro: "Now, in this first part, I'd like to ask you some questions about yourself.",
  newTopic: "Let's move on to another topic.",
  part2Intro:
    "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to prepare, and you can make some notes if you wish.",
  part3Intro: "We've been talking about this topic. Now I'd like to discuss some more general questions.",
  wellDone: 'Thank you. That is the end of the speaking test.'
}

export const FORECAST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export type ForecastStatusType = (typeof FORECAST_STATUS)[keyof typeof FORECAST_STATUS]

export const FREE_SIGNUP_BALANCE = 3

export const PART_GROUP = {
  PART1: '1',
  PART23: '2,3'
} as const
