import z from 'zod'
import { createCreditPackageSchema } from './credit-package.validation'

export type CreateCreditPackageBodyType = z.infer<typeof createCreditPackageSchema>['body']
