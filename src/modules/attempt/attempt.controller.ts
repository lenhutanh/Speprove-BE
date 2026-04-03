import { Response } from 'express'
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
}
