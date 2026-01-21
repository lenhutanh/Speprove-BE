import { z } from 'zod'
import { createGroupSchema, updateGroupSchema } from '~/validations'
import { permissionResSchema } from './permission.type'

export type CreateGroupBodyType = z.infer<typeof createGroupSchema>['body']
export type UpdateGroupBodyType = z.infer<typeof updateGroupSchema>['body']

export const groupResSchema = z
  .object({
    _id: z.any(),
    name: z.string(),
    description: z.string().optional(),
    kind: z.number(),
    permissions: z.array(permissionResSchema).transform((val) => val.map((item) => item.pCode))
  })
  .strip()

export type GroupResType = z.infer<typeof groupResSchema>
