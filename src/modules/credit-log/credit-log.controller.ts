import { Response } from 'express'
import { singleton } from 'tsyringe'
import { AuthenticatedRequest } from '~/common/types'
import { CreditLogService } from './credit-log.service'
import { ResponseTransformer } from '~/common/http'

@singleton()
export class CreditLogController {
  constructor(private readonly creditLogService: CreditLogService) {}

  public async getList(req: AuthenticatedRequest, res: Response) {
    const result = await this.creditLogService.getList(req.user._id, req.validated.query)
    return ResponseTransformer.success(res, result, 'Get credit log list successfully')
  }
}
