export const CREDIT_LOG_REF_TYPE = {
  PAYMENT: 'payment',
  USAGE: 'usage',
  MANUAL: 'manual',
  REFUND: 'refund'
} as const

export type CreditLogRefType = (typeof CREDIT_LOG_REF_TYPE)[keyof typeof CREDIT_LOG_REF_TYPE]

export const CREDIT_COST = {
  PRACTICE: {
    PART_1: 5,
    PART_2: 20,
    PART_3: 10
  },
  MOCK: {
    PART_1: 40,
    PART_2: 20,
    PART_3: 50
  },
  FULL_TEST: 100
} as const
