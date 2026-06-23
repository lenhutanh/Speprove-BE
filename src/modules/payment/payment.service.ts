import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IPaymentRepository } from './payment.repository.interface'
import { CreatePaymentBodyType } from './payment.type'
import { CreditPackageService } from '../credit-package/credit-package.service'
import { env } from '~/common/config'
import { toObjectId } from '~/common/utils'
import {
  BUFFER_TIME,
  EXPIRED_DURATION,
  METHOD_TO_PROVIDER,
  PAYMENT_STATUS,
  PaymentProviderType
} from './payment.constants'
import { CREDIT_LOG_REF_TYPE, CREDIT_LOG_TYPE } from '../credit-log/credit-log.constants'
import { PaymentProviderFactory } from './providers/payment-provider.factory'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { PaymentMapper } from './payment.mapper'
import { AccountService } from '../account/account.service'
import { CreditLogService } from '../credit-log/credit-log.service'

@singleton()
export class PaymentService {
  constructor(
    @inject(TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly creditPackageService: CreditPackageService,
    private readonly creditLogService: CreditLogService,
    private readonly paymentMapper: PaymentMapper,
    private readonly accountService: AccountService
  ) {}

  public async create(userId: string, data: CreatePaymentBodyType) {
    const creditPackage = await this.creditPackageService.getDetails(data.packageId)
    const existingPayment = await this.paymentRepository.findOne({
      userId,
      packageId: data.packageId,
      method: data.method,
      status: PAYMENT_STATUS.PENDING,
      expiredAt: { $gt: new Date(Date.now() + BUFFER_TIME) }
    })

    if (existingPayment) {
      return this.paymentMapper.toResponse(existingPayment)
    }

    const provider = METHOD_TO_PROVIDER[data.method]
    const paymentProvider = this.paymentProviderFactory.getProvider(provider)
    const orderCode = this.generateOrderCode()
    const expiredAtTimestamp = Math.floor(Date.now() / 1000) + EXPIRED_DURATION

    const result = await paymentProvider.createPaymentLink({
      orderCode,
      amount: creditPackage.amount,
      description: `Nap ${creditPackage.points} diem`,
      returnUrl: `${env.APP_URL}/payment/result`,
      cancelUrl: `${env.APP_URL}/payment/cancel`,
      expiredAt: expiredAtTimestamp
    })

    const payment = await this.paymentRepository.create({
      userId: toObjectId(userId),
      orderCode,
      packageId: creditPackage._id,
      amount: creditPackage.amount,
      points: creditPackage.points,
      method: data.method,
      provider,
      externalId: result.externalId,
      expiredAt: new Date(expiredAtTimestamp * 1000),
      qrCode: result.qrCode,
      accountName: result.accountName,
      accountNumber: result.accountNumber,
      bin: result.bin,
      description: result.description
    })

    return this.paymentMapper.toResponse(payment)
  }

  public async handleWebhook(providerName: PaymentProviderType, payload: unknown) {
    const paymentProvider = this.paymentProviderFactory.getProvider(providerName)
    const data = await paymentProvider.handleWebhook(payload)

    const payment = await this.paymentRepository.findOne({ orderCode: data.orderCode })
    if (!payment || payment.status !== PAYMENT_STATUS.PENDING) return

    if (payment.amount !== data.amount) {
      console.error(
        `[Webhook Alert] Mismatch amount for order ${data.orderCode}. Expected: ${payment.amount}, Actual: ${data.amount}`
      )
      return
    }

    await this.paymentRepository.withTransaction(async (session) => {
      const updateResult = await this.paymentRepository.updateOne(
        { _id: payment._id, status: PAYMENT_STATUS.PENDING },
        {
          status: data.status,
          webhookVerified: true,
          webhookReceivedAt: new Date(),
          paidAt: data.status === PAYMENT_STATUS.SUCCESS ? new Date() : undefined,
          externalId: data.externalId
        },
        { session }
      )

      if (!updateResult) {
        console.log(`[Webhook] Order ${data.orderCode} already processed by another request.`)
        return
      }

      if (data.status === PAYMENT_STATUS.SUCCESS) {
        const account = await this.accountService.addBalance(payment.userId.toString(), payment.points, session)
        if (account) {
          await this.creditLogService.create(
            {
              userId: payment.userId,
              type: CREDIT_LOG_TYPE.PLUS,
              amount: payment.points,
              description: `Nạp ${payment.points} điểm`,
              descriptionKey: 'credit_log.payment_success',
              descriptionMetadata: {
                points: payment.points,
                amount: payment.amount,
                method: payment.method
              },
              refType: CREDIT_LOG_REF_TYPE.PAYMENT,
              refId: payment._id,
              balanceBefore: account.balance - payment.points,
              balanceAfter: account.balance
            },
            session
          )
        }
      }
    })
  }

  public async getDetails(userId: string, paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId)
    if (!payment) throw new AppError('Payment not found', StatusCodes.NOT_FOUND)
    if (payment.userId.toString() !== userId) throw new AppError('Forbidden', StatusCodes.FORBIDDEN)
    if (payment.status === PAYMENT_STATUS.PENDING && new Date() > payment.expiredAt) {
      await this.paymentRepository.updateOne({ _id: payment._id }, { status: PAYMENT_STATUS.EXPIRED })
      payment.status = PAYMENT_STATUS.EXPIRED
    }
    return payment
  }

  private generateOrderCode = () => Date.now() * 100 + Math.floor(Math.random() * 100)
}
