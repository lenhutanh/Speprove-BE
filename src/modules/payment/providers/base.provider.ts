import { CreatePaymentLinkParams, CreatePaymentLinkResult, NormalizedWebhookData } from '../payment.type'

export interface IPaymentProvider {
  createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult>
  handleWebhook(payload: unknown): Promise<NormalizedWebhookData>
}
