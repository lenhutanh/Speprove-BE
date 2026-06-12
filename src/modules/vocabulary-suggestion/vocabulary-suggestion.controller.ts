import { AuthenticatedRequest } from '~/common/types/request.type'
import { VocabularySuggestionService } from './vocabulary-suggestion.service'
import { Response } from 'express'
import { ResponseTransformer } from '~/common/http'
import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { singleton } from 'tsyringe'

@singleton()
export class VocabularySuggestionController {
  constructor(private readonly vocabularySuggestionService: VocabularySuggestionService) {}

  public async create(req: AuthenticatedRequest, res: Response) {
    const result = await this.vocabularySuggestionService.createManual(req.validated.body)
    return ResponseTransformer.success(res, result, 'Create vocabulary suggestion successfully', StatusCodes.CREATED)
  }

  public async getApproved(req: Request, res: Response) {
    const result = await this.vocabularySuggestionService.getApprovedByQuestion((req as any).validated.query)
    return ResponseTransformer.success(res, result, 'Get approved vocabulary suggestions successfully')
  }

  public async getList(req: AuthenticatedRequest, res: Response) {
    const result = await this.vocabularySuggestionService.getList(req.validated.query)
    return ResponseTransformer.success(res, result, 'Get vocabulary suggestions successfully')
  }

  public async update(req: AuthenticatedRequest, res: Response) {
    await this.vocabularySuggestionService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.successNoData(res, 'Update vocabulary suggestion successfully')
  }

  public async approveVocab(req: AuthenticatedRequest, res: Response) {
    await this.vocabularySuggestionService.approve(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Approve vocabulary suggestion successfully')
  }

  public async hideVocab(req: AuthenticatedRequest, res: Response) {
    await this.vocabularySuggestionService.hide(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Hide vocabulary suggestion successfully')
  }

  public async getVocabularyAudio(req: Request, res: Response) {
    const result = await this.vocabularySuggestionService.getVocabularyAudio(
      req.validated.params.id,
      req.validated.query.voiceId
    )
    return ResponseTransformer.success(res, result, 'Get vocabulary audio successfully')
  }
}
