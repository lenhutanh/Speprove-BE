import { BaseMapper } from '~/common/base'
import { PaymentType } from './payment.model'
import { PaymentResponseDto } from './payment.dto'
import { singleton } from 'tsyringe'

@singleton()
export class PaymentMapper extends BaseMapper<PaymentType, PaymentResponseDto> {
  toResponse(entity: PaymentType): PaymentResponseDto {
    return {
      id: entity._id.toString(),
      orderCode: entity.orderCode,
      amount: entity.amount,
      points: entity.points,
      status: entity.status,
      method: entity.method,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
      qrCode: entity.qrCode,
      accountName: entity.accountName,
      accountNumber: entity.accountNumber,
      bin: entity.bin,
      description: entity.description
    }
  }
}
