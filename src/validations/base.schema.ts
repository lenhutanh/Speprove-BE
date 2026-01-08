import { z, ZodRawShape } from 'zod'
import { objectIdSchema } from '~/utils/validators.util'

export const createSchema = <T extends ZodRawShape>(fields: T) =>
  z.object({
    body: z.object(fields).strip()
  })

export const updateSchema = <T extends ZodRawShape>(fields: T) =>
  z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object(fields).strip()
  })

export const querySchema = <T extends ZodRawShape>(fields: T) =>
  z.object({
    query: z.object(fields).strip()
  })

export const idParamSchema = z.object({ params: z.object({ id: objectIdSchema }) })
