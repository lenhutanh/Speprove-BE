import express from 'express'
import { permissionController } from '~/controllers'
import { authMiddleware } from '~/middlewares/'
import { validateMiddleware } from '~/middlewares/validate.middleware'
import { idParamSchema } from '~/validations/base.schema'
import { createPermissionSchema, updatePermissionSchema } from '~/validations'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, authMiddleware.hasPermission('PER_L'), permissionController.getAll)
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_C'),
    validateMiddleware.validate(createPermissionSchema),
    permissionController.createNew
  )

Router.route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_V'),
    validateMiddleware.validate(idParamSchema),
    permissionController.getDetails
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_U'),
    validateMiddleware.validate(updatePermissionSchema),
    permissionController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_D'),
    validateMiddleware.validate(idParamSchema),
    permissionController.remove
  )

export const permissionRoutes = Router
