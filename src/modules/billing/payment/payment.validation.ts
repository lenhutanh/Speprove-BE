import z from 'zod'
import { createSchema } from '~/core/persistence/base.validation'
import { PAYMENT_METHOD } from './payment.constants'
import { objectIdSchema } from '~/core/utils/validators.util'

export const createPaymentSchema = createSchema({
  packageId: objectIdSchema,
  method: z.enum(Object.values(PAYMENT_METHOD) as [string, ...string[]])
})
