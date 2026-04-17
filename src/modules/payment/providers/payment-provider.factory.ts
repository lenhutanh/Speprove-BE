import { singleton } from 'tsyringe'
import { PAYMENT_PROVIDER } from '~/common/constants/constants'
import { IPaymentProvider } from './base.provider'
import { PayOSProvider } from './payos.provider'

@singleton()
export class PaymentProviderFactory {
  constructor(private readonly payOSProvider: PayOSProvider) {}

  public getProvider(providerName: string): IPaymentProvider {
    switch (providerName) {
      case PAYMENT_PROVIDER.PAYOS:
        return this.payOSProvider
      default:
        throw new Error(`[PaymentFactory] Provider '${providerName}' is not supported!`)
    }
  }
}
