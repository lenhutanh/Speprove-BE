import express from 'express'
import { container } from 'tsyringe'
import { validateMiddleware } from '~/common/middlewares'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/utils'
import { AttemptController } from './attempt.controller'
import { createAttemptSchema } from './attempt.validation'
import { idParamSchema } from '~/common/base'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/')
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createAttemptSchema),
    bindHandler(AttemptController, 'createNew')
  )

router
  .route('/:id')
  .get(authMiddleware.isAuthorized, validateMiddleware(idParamSchema), bindHandler(AttemptController, 'getDetails'))
export const attemptRoutes = router
