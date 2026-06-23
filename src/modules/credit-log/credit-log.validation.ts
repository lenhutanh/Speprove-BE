import { z } from 'zod'
import { querySchema } from '~/common/base'
import { CREDIT_LOG_REF_TYPE, CREDIT_LOG_TYPE } from './credit-log.constants'

export const getListCreditLogSchema = querySchema({
  type: z.enum(Object.values(CREDIT_LOG_TYPE) as [string, ...string[]]).optional(),
  refType: z.enum(Object.values(CREDIT_LOG_REF_TYPE) as [string, ...string[]]).optional()
})

