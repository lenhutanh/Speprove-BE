import mongoose from 'mongoose'
import { container } from 'tsyringe'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { TOKENS } from '~/common/constants/di.tokens'
import { STATUS } from '~/common/constants/status.constants'
import { Account } from '~/modules/account/account.model'
import { IAccountRepository } from '~/modules/account/repositories'
import { CreditLog } from '~/modules/credit-log/credit-log.model'
import { Group } from '~/modules/group/group.model'
import { GROUP_KIND } from '~/modules/group/group.constants'
import { Payment } from '~/modules/payment/payment.model'
import { PAYMENT_METHOD, PAYMENT_PROVIDER, PAYMENT_STATUS } from '~/modules/payment/payment.constants'
import { PaymentService } from '~/modules/payment/payment.service'
import { PaymentProviderFactory } from '~/modules/payment/providers/payment-provider.factory'
import { resetMongo, startMongo, stopMongo } from '../helpers/mongo'
import { setupTestContainer } from '../helpers/test-container'

const ORDER_CODE = 1700000000001

// PaymentService is a singleton, so the provider stub is registered once and the payload changes per test
let webhookResult = {
  orderCode: ORDER_CODE,
  amount: 50000,
  status: PAYMENT_STATUS.SUCCESS as string,
  externalId: 'ext'
}

async function createAccount(balance: number) {
  const group = await Group.create({ name: `user-${Date.now()}-${Math.random()}`, kind: GROUP_KIND.USER })
  return Account.create({
    username: `u${Math.random().toString(36).slice(2)}`,
    email: `${Math.random().toString(36).slice(2)}@example.com`,
    groupId: group._id,
    status: STATUS.ACTIVE,
    balance
  })
}

describe('credit balance and payment webhook', () => {
  beforeAll(async () => {
    setupTestContainer()
    container.registerInstance(PaymentProviderFactory, {
      getProvider: () => ({ handleWebhook: async () => webhookResult })
    } as never)
    await startMongo()
  })
  afterAll(stopMongo)
  beforeEach(resetMongo)

  it('never lets parallel deductions drive the balance below zero', async () => {
    const account = await createAccount(10)
    const repository = container.resolve<IAccountRepository>(TOKENS.IAccountRepository)

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        repository.withTransaction((session) => repository.deductBalance(account._id.toString(), 3, session))
      )
    )

    expect(results.filter(Boolean)).toHaveLength(3) // 3 x 3 = 9 fits in 10, the other two are refused
    expect((await Account.findById(account._id))?.balance).toBe(1)
  })

  it('credits the points once when the same successful webhook arrives twice', async () => {
    const account = await createAccount(0)
    await Payment.create({
      userId: account._id,
      orderCode: ORDER_CODE,
      externalId: 'ext-1',
      packageId: new mongoose.Types.ObjectId(),
      amount: 50000,
      points: 100,
      method: PAYMENT_METHOD.BANK_TRANSFER,
      provider: PAYMENT_PROVIDER.PAYOS,
      expiredAt: new Date(Date.now() + 60_000),
      qrCode: 'qr',
      accountName: 'name',
      accountNumber: '123',
      bin: '970',
      description: 'desc'
    })
    webhookResult = { ...webhookResult, amount: 50000, externalId: 'ext-1' }
    const service = container.resolve(PaymentService)

    await Promise.all([
      service.handleWebhook(PAYMENT_PROVIDER.PAYOS, {}),
      service.handleWebhook(PAYMENT_PROVIDER.PAYOS, {})
    ])
    await service.handleWebhook(PAYMENT_PROVIDER.PAYOS, {})

    expect((await Account.findById(account._id))?.balance).toBe(100)
    expect(await CreditLog.countDocuments({ userId: account._id })).toBe(1)
    expect((await Payment.findOne({ orderCode: ORDER_CODE }))?.status).toBe(PAYMENT_STATUS.SUCCESS)
  })

  it('ignores a webhook whose amount differs from the order', async () => {
    const account = await createAccount(0)
    await Payment.create({
      userId: account._id,
      orderCode: ORDER_CODE,
      externalId: 'ext-2',
      packageId: new mongoose.Types.ObjectId(),
      amount: 50000,
      points: 100,
      method: PAYMENT_METHOD.BANK_TRANSFER,
      provider: PAYMENT_PROVIDER.PAYOS,
      expiredAt: new Date(Date.now() + 60_000),
      qrCode: 'qr',
      accountName: 'name',
      accountNumber: '123',
      bin: '970',
      description: 'desc'
    })
    webhookResult = { ...webhookResult, amount: 1 }

    await container.resolve(PaymentService).handleWebhook(PAYMENT_PROVIDER.PAYOS, {})

    expect((await Account.findById(account._id))?.balance).toBe(0)
    expect((await Payment.findOne({ orderCode: ORDER_CODE }))?.status).toBe(PAYMENT_STATUS.PENDING)
  })
})
