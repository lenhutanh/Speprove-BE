import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { PaymentRepository } from './payment.repository'

export const registerPaymentModule = () => {
  container.registerSingleton(TOKENS.IPaymentRepository, PaymentRepository)
}
