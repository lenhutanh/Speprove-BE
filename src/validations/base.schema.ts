import { z, ZodRawShape } from 'zod'
import { objectIdSchema } from '~/utils/validators.util'

export const baseQueryFields = {
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(4),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
}

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
    query: z.object({ ...baseQueryFields, ...fields }).strip()
  })

export const idParamSchema = z.object({ params: z.object({ id: objectIdSchema }) })
