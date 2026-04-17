import z from 'zod'
import { createSchema } from '~/common/base'

export const createCreditPackageSchema = createSchema({
  amount: z.number().int().min(1000),
  points: z.number().int().min(1)
})
