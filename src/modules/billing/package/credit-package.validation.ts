import z from 'zod'
import { createSchema } from '~/core/persistence/base.validation'

export const createCreditPackageSchema = createSchema({
  amount: z.number().int().min(1000),
  points: z.number().int().min(1)
})
