export const DOMAIN_EVENTS = {
  AUTH: {
    REGISTERED: 'auth.registered',
    VERIFIED: 'auth.verified'
  },
  MEDIA: {
    UPLOADED: 'media.uploaded',
    PROCESSED: 'media.processed'
  },
  QUESTION: {
    CREATED: 'question.created'
  }
} as const

export type DomainEventName =
  (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS][keyof (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS]]
