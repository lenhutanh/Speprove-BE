import z from 'zod'
import { createPermissionSchema, updatePermissionSchema } from '~/validations'

export type CreatePermissionBodyType = z.infer<typeof createPermissionSchema>['body']
export type UpdatePermissionBodyType = z.infer<typeof updatePermissionSchema>['body']

export const permissionResSchema = z
  .object({
    _id: z.any(),
    name: z.string(),
    description: z.string().optional(),
    pCode: z.string(),
    permissionGroupId: z.any()
  })
  .strip()

export type PermissionResType = z.infer<typeof permissionResSchema>
