export const CREDIT_LOG_REF_TYPE = {
  PAYMENT: 'payment',
  USAGE: 'usage',
  MANUAL: 'manual',
  REFUND: 'refund'
} as const

export type CreditLogRefType = (typeof CREDIT_LOG_REF_TYPE)[keyof typeof CREDIT_LOG_REF_TYPE]

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
