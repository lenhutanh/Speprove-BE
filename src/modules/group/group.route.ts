import express from 'express'
import { validateMiddleware } from '~/common/middlewares/validate.middleware'
import { idParamSchema } from '~/common/base/base.validation'
import { createGroupSchema, updateGroupSchema } from './group.validation'
import { bindHandler } from '~/common/utils'
import { GroupController } from './group.controller'
import { container } from 'tsyringe'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  // .get(
  //   authMiddleware.isAuthorized,
  //   authMiddleware.hasPermission('GROUP:VIEW:ALL'),
  //   bindHandler(GroupController, 'getList')
  // )
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('GROUP:CREATE'),
    validateMiddleware(createGroupSchema),
    bindHandler(GroupController, 'createNew')
  )

router
  .route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('GROUP:VIEW'),
    validateMiddleware(idParamSchema),
    bindHandler(GroupController, 'getDetails')
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('GROUP:UPDATE'),
    validateMiddleware(updateGroupSchema),
    bindHandler(GroupController, 'update')
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.hasPermission('GROUP:DELETE'),
    validateMiddleware(idParamSchema),
    bindHandler(GroupController, 'remove')
  )

export const groupRoutes = router
