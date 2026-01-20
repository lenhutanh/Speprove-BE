import express from 'express'
import { permissionGroupController } from '~/controllers'
import { authMiddleware } from '~/middlewares'
import { validateMiddleware } from '~/middlewares/validate.middleware'
import { idParamSchema } from '~/validations/base.schema'
import { createPermissionGroupSchema, updatePermissionGroupSchema } from '~/validations'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, authMiddleware.hasPermission('PER_G_L'), permissionGroupController.getAll)
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_G_C'),
    validateMiddleware.validate(createPermissionGroupSchema),
    permissionGroupController.createNew
  )

Router.route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_G_V'),
    validateMiddleware.validate(idParamSchema),
    permissionGroupController.getDetails
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_G_U'),
    validateMiddleware.validate(updatePermissionGroupSchema),
    permissionGroupController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('PER_G_D'),
    validateMiddleware.validate(idParamSchema),
    permissionGroupController.remove
  )

export const permissionGroupRoutes = Router
