export const QUEUE_NAME = {
  MAIL: 'mail-queue',
  SPEAKING: 'speaking-queue'
} as const

export type QueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME]

export const JOB_NAME = {
  MAIL: {
    SEND_OTP: 'mail:send-otp'
  },
  VOICE: {
    GENERATE: 'voice:generate'
  },
  SPEAKING: {
    TRANSCRIBE: 'speaking:transcribe',
    ASSESS: 'speaking:assess',
    EVALUATE: 'speaking:evaluate',
    SCORE_SESSION: 'speaking:score-session',
    EXTRACT_VOCABULARY: 'speaking:extract-vocabulary'
  }
} as const
