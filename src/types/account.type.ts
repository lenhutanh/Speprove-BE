import z from 'zod'
import { updateProfileSchema } from '~/validations'
import { groupResSchema } from './group.type'

export type UpdateProfileBodyType = z.infer<typeof updateProfileSchema>['body']

export const accountResSchema = z
  .object({
    _id: z.any(),
    username: z.string(),
    email: z.string().email(),
    fullName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    kind: z.number(),
    isSuperAdmin: z.boolean(),
    group: groupResSchema,
    status: z.number(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
  })
  .strip()

export type AccountResType = z.infer<typeof accountResSchema>
