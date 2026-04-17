import { IBaseRepository } from '~/common/base'
import { PaymentType } from './payment.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPaymentRepository extends IBaseRepository<PaymentType> {}
