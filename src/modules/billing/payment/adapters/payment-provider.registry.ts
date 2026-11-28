import { singleton } from 'tsyringe'
import { PAYMENT_PROVIDER } from '../payment.constants'
import { IPaymentProvider } from './payment.provider.interface'
import { PayOSProvider } from './payos.provider'

@singleton()
export class PaymentProviderRegistry {
  constructor(private readonly payOSProvider: PayOSProvider) {}

  public getProvider(providerName: string): IPaymentProvider {
    switch (providerName) {
      case PAYMENT_PROVIDER.PAYOS:
        return this.payOSProvider
      default:
        throw new Error(`[PaymentProviderRegistry] Provider '${providerName}' is not supported!`)
    }
  }
}
