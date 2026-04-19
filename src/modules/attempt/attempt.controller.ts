import { Request, Response } from 'express'
import { AuthenticatedRequest } from '~/common/interfaces/request.interface'
import { AttemptService } from './attempt.service'
import { ResponseTransformer } from '~/common/utils'
import { singleton } from 'tsyringe'

@singleton()
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  public async createNew(req: AuthenticatedRequest, res: Response) {
    const attempt = await this.attemptService.createNew(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, attempt, 'Create attempt successfully')
  }

  public async getDetails(req: AuthenticatedRequest, res: Response) {
    const attempt = await this.attemptService.getDetails(req.user._id, req.validated.params.id)
    return ResponseTransformer.success(res, attempt, 'Get attempt details successfully')
  }

  public async getList(req: AuthenticatedRequest, res: Response) {
    const result = await this.attemptService.getList(req.user._id, req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get attempt list successfully')
  }

  public async getLeaderboard(req: Request, res: Response) {
    const result = await this.attemptService.getTopAttemptsByQuestion(req.validated.query)
    return ResponseTransformer.success(res, result, 'Get top attempts by question successfully')
  }

  public async toggleShare(req: AuthenticatedRequest, res: Response) {
    const { id } = req.validated.params
    const { isPublic } = req.validated.body
    const attempt = await this.attemptService.toggleShareStatus(req.user._id, id, isPublic)
    const message = isPublic ? 'Attempt is now public' : 'Attempt is now private'
    return ResponseTransformer.success(res, attempt, message)
  }
}
