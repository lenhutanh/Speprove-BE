import express from 'express'
import { container } from 'tsyringe'
import { idParamSchema } from '~/common/base'
import { AuthMiddleware } from '~/common/middlewares/auth.middleware'
import { bindHandler } from '~/common/utils'
import { VocabularySuggestionController } from './vocabulary-suggestion.controller'
import {
  approvedVocabularySuggestionQuerySchema,
  createVocabularySuggestionSchema,
  updateVocabularySuggestionSchema,
  vocabularySuggestionQuerySchema
} from './vocabulary-suggestion.validation'
import { validateMiddleware } from '~/common/middlewares'

const router = express.Router()

const authMiddleware = container.resolve(AuthMiddleware)

router
  .route('/approved')
  .get(
    validateMiddleware(approvedVocabularySuggestionQuerySchema),
    bindHandler(VocabularySuggestionController, 'getApproved')
  )

router
  .route('/')
  .get(
    authMiddleware.isAuthorized,
    validateMiddleware(vocabularySuggestionQuerySchema),
    bindHandler(VocabularySuggestionController, 'getList')
  )
  .post(
    authMiddleware.isAuthorized,
    validateMiddleware(createVocabularySuggestionSchema),
    bindHandler(VocabularySuggestionController, 'create')
  )

router
  .route('/:id/approve')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(VocabularySuggestionController, 'approveVocab')
  )

router
  .route('/:id/hide')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(idParamSchema),
    bindHandler(VocabularySuggestionController, 'hideVocab')
  )

router
  .route('/:id')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(updateVocabularySuggestionSchema),
    bindHandler(VocabularySuggestionController, 'update')
  )

export const vocabularySuggestionRoutes = router
