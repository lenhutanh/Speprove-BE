import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { VoiceService } from './voice.service'
import { ResponseTransformer } from '~/common/utils'
import { injectable } from 'tsyringe'

@injectable()
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  public async createNew(req: Request, res: Response) {
    const voice = await this.voiceService.createNew(req.validated.body)
    return ResponseTransformer.success(res, voice, 'Created voice successfully', StatusCodes.CREATED)
  }

  public async update(req: Request, res: Response) {
    const voice = await this.voiceService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, voice, 'Updated voice successfully')
  }

  public async activate(req: Request, res: Response) {
    await this.voiceService.activate(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Activate voice successfully')
  }
}
