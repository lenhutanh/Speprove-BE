import express from 'express'
import { validateMiddleware } from '~/common/middlewares/validate.middleware'
import { idParamSchema } from '~/common/base/base.validation'
import { createPermissionSchema, updatePermissionSchema } from './permission.validation'
import { bindHandler } from '~/common/http'
import { PermissionController } from './permission.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

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
