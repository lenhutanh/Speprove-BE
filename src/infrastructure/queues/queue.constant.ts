export const QUEUE_NAME = {
  FILE: 'file_queue',
  MAIL: 'mail_queue'
} as const

export type QueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME]

export const JOB_NAME = {
  MAIL: {
    SEND_OTP: 'mail:send-otp'
  },
  VOICE: {
    GENERATE: 'voice:generate'
  },
  QUESTION_AUDIO: {
    GENERATE: 'question-audio:generate'
  }
} as const
