import { singleton } from 'tsyringe'
import { SpeakingSessionService } from './speaking-session.service'
import { Response } from 'express'
import { ResponseTransformer } from '~/common/http'
import { AuthenticatedRequest } from '~/common/types/request.type'

@singleton()
export class SpeakingSessionController {
  constructor(private readonly speakingSessionService: SpeakingSessionService) {}

  public async createNew(req: AuthenticatedRequest, res: Response) {
    const speakingSession = await this.speakingSessionService.createNew(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, speakingSession, 'Create speaking session successfully')
  }

  public async getActiveSession(req: AuthenticatedRequest, res: Response) {
    const speakingSession = await this.speakingSessionService.getActiveSession(req.user._id)
    return ResponseTransformer.success(res, speakingSession, 'Get active speaking session successfully')
  }

  public async getCurrentQuestion(req: AuthenticatedRequest, res: Response) {
    const result = await this.speakingSessionService.getCurrentQuestion(req.user._id, req.validated.params.id)
    return ResponseTransformer.success(res, result, 'Get current question successfully')
  }

  public async getList(req: AuthenticatedRequest, res: Response) {
    const result = await this.speakingSessionService.getList(req.user._id, req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get speaking session list successfully')
  }

  public async getDetails(req: AuthenticatedRequest, res: Response) {
    const result = await this.speakingSessionService.getDetails(req.user._id, req.validated.params.id)
    return ResponseTransformer.success(res, result, 'Get speaking session details successfully')
  }
}
