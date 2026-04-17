import { BaseRepository } from '~/common/base'
import { Payment, PaymentType } from './payment.model'
import { singleton } from 'tsyringe'
import { IPaymentRepository } from './payment.repository.interface'

@singleton()
export class PaymentRepository extends BaseRepository<PaymentType> implements IPaymentRepository {
  constructor() {
    super(Payment)
  }
}
