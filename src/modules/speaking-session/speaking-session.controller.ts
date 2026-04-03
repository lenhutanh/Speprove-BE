import { singleton } from 'tsyringe'
import { SpeakingSessionService } from './speaking-session.service'
import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { AuthenticatedRequest } from '~/common/interfaces/request.interface'

@singleton()
export class SpeakingSessionController {
  constructor(private readonly speakingSessionService: SpeakingSessionService) {}

  public async createNew(req: AuthenticatedRequest, res: Response) {
    const speakingSession = await this.speakingSessionService.createNew(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, speakingSession, 'Create speaking session successfully')
  }
}
