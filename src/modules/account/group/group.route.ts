import express from 'express'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'
import { idParamSchema } from '~/core/persistence/base.validation'
import { createGroupSchema, updateGroupSchema } from './group.validation'
import { bindHandler } from '~/core/http/bind-handler'
import { GroupController } from './group.controller'
import { authMiddleware } from '~/core/middlewares/auth.middleware'

const router = express.Router()

router
  .route('/')
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
