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
