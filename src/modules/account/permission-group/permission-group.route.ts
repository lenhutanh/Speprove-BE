import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { idParamSchema } from '~/core/persistence/base.validation'
import { createPermissionGroupSchema, updatePermissionGroupSchema } from './permission-group.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { PermissionGroupController } from './permission-group.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'

const router = express.Router()

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION_GROUP:CREATE'),
    validateMiddleware(createPermissionGroupSchema),
    bindHandler(PermissionGroupController, 'createNew')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION_GROUP:VIEW'),
    validateMiddleware(idParamSchema),
    bindHandler(PermissionGroupController, 'getDetails')
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION_GROUP:UPDATE'),
    validateMiddleware(updatePermissionGroupSchema),
    bindHandler(PermissionGroupController, 'update')
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION_GROUP:DELETE'),
    validateMiddleware(idParamSchema),
    bindHandler(PermissionGroupController, 'remove')
  )

export const permissionGroupRoutes = router
