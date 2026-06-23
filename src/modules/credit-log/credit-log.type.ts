import { z } from 'zod'
import { getListCreditLogSchema } from './credit-log.validation'

export type GetListCreditLogQuery = z.infer<typeof getListCreditLogSchema>['query']
