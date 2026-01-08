import express from 'express'
import { groupController } from '~/controllers'
import { authMiddleware } from '~/middlewares'
import { validateMiddleware } from '~/middlewares/validate.middleware'
import { idParamSchema } from '~/validations/base.schema'
import { createGroupSchema, updateGroupSchema } from '~/validations/group.validation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, groupController.getAll)
  .post(authMiddleware.isAuthorized, validateMiddleware.validate(createGroupSchema), groupController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware.validate(idParamSchema), groupController.getDetails)
  .put(authMiddleware.isAuthorized, validateMiddleware.validate(updateGroupSchema), groupController.update)
  .delete(authMiddleware.isAuthorized, validateMiddleware.validate(idParamSchema), groupController.remove)

export const groupRoutes = Router
