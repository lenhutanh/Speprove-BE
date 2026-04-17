import z from 'zod'
import { createSchema } from '~/common/base'
import { PAYMENT_METHOD } from '~/common/constants/constants'
import { objectIdSchema } from '~/common/utils'

export const createPaymentSchema = createSchema({
  packageId: objectIdSchema,
  method: z.enum(Object.values(PAYMENT_METHOD) as [string, ...string[]])
})
