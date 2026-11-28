import { IBaseRepository } from '~/core/persistence/base.repository.interface'
import { PaymentType } from './payment.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPaymentRepository extends IBaseRepository<PaymentType> {}
