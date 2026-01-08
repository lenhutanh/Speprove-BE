import z from 'zod'
import { createPermissionGroupSchema, updatePermissionGroupSchema } from '~/validations/permission-group.validation'

export type CreatePermissionGroupBodyType = z.infer<typeof createPermissionGroupSchema>['body']
export type UpdatePermissionGroupBodyType = z.infer<typeof updatePermissionGroupSchema>['body']
