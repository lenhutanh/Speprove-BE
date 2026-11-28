import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { idParamSchema } from '~/core/persistence/base.validation'
import { createPermissionSchema, updatePermissionSchema } from './permission.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { PermissionController } from './permission.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'

const router = express.Router()

router
  .route('/')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION:VIEW:ALL'),
    bindHandler(PermissionController, 'getList')
  )
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION:CREATE'),
    validateMiddleware(createPermissionSchema),
    bindHandler(PermissionController, 'createNew')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION:VIEW'),
    validateMiddleware(idParamSchema),
    bindHandler(PermissionController, 'getDetails')
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION:UPDATE'),
    validateMiddleware(updatePermissionSchema),
    bindHandler(PermissionController, 'update')
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PERMISSION:DELETE'),
    validateMiddleware(idParamSchema),
    bindHandler(PermissionController, 'remove')
  )

export const permissionRoutes = router
