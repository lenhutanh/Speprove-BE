import express from 'express'
import { idParamSchema } from '~/core/persistence/base.validation'
import { authMiddleware } from '~/core/middlewares/auth.middleware'
import { bindHandler } from '~/core/http/bind-handler'
import { VocabularySuggestionController } from './vocabulary-suggestion.controller'
import {
  approvedVocabularySuggestionQuerySchema,
  createVocabularySuggestionSchema,
  getVocabularyQuerySchema,
  updateVocabularySuggestionSchema,
  vocabularySuggestionQuerySchema
} from './vocabulary-suggestion.validation'
import { validateMiddleware } from '~/core/middlewares/validate.middleware'

const router = express.Router()

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
  .route('/:id/audio')
  .get(validateMiddleware(getVocabularyQuerySchema), bindHandler(VocabularySuggestionController, 'getVocabularyAudio'))

router
  .route('/:id')
  .put(
    authMiddleware.isAuthorized,
    validateMiddleware(updateVocabularySuggestionSchema),
    bindHandler(VocabularySuggestionController, 'update')
  )

export const vocabularySuggestionRoutes = router
