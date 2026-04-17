import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { PaymentRepository } from './payment.repository'

export const registerPaymentModule = () => {
  container.registerSingleton(TOKENS.IPaymentRepository, PaymentRepository)
}
