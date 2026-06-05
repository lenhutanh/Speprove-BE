import { PayOS } from '@payos/node'
import { IPaymentProvider } from './base.provider'
import { env } from '~/common/config'
import { CreatePaymentLinkParams, CreatePaymentLinkResult, NormalizedWebhookData } from '../payment.type'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { PAYMENT_STATUS } from '../payment.constants'
import { singleton } from 'tsyringe'

@singleton()
export class PayOSProvider implements IPaymentProvider {
  private client: PayOS
  constructor() {
    this.client = new PayOS({
      clientId: env.PAYOS_CLIENT_ID,
      apiKey: env.PAYOS_API_KEY,
      checksumKey: env.PAYOS_CHECKSUM_KEY
    })
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult> {
    const { amount, cancelUrl, description, orderCode, returnUrl } = params
    const data = await this.client.paymentRequests.create({
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl
    })

    return {
      externalId: data.paymentLinkId,
      paymentUrl: data.checkoutUrl,
      qrCode: data.qrCode,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bin: data.bin,
      amount: data.amount,
      description: data.description
    }
  }

  async handleWebhook(payload: unknown): Promise<NormalizedWebhookData> {
    try {
      const res = await this.client.webhooks.verify(payload as any)
      return {
        orderCode: res.orderCode,
        status: res.code === '00' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
        amount: res.amount,
        externalId: res.paymentLinkId,
        raw: payload
      }
    } catch {
      throw new AppError('Invalid webhook payload', StatusCodes.BAD_REQUEST)
    }
  }
}
