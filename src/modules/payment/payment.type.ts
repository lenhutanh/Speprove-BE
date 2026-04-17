import z from 'zod'
import { PaymentStatusType } from '~/common/constants/constants'
import { createPaymentSchema } from './payment.validation'

export type CreatePaymentLinkParams = {
  orderCode: number
  amount: number
  description: string
  returnUrl: string
  cancelUrl: string
  expiredAt: number
}

export type CreatePaymentLinkResult = {
  externalId: string
  paymentUrl: string
  qrCode: string
  accountName: string
  accountNumber: string
  bin: string
  amount: number
  description: string
}

export type NormalizedWebhookData = {
  orderCode: number
  status: PaymentStatusType
  amount: number
  externalId: string
  raw?: unknown
}

export type CreatePaymentBodyType = z.infer<typeof createPaymentSchema>['body']
