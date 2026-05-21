import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { singleton } from 'tsyringe'
import { AccountService } from './account.service'
import { AuthenticatedRequest } from '~/common/interfaces/request.interface'

@singleton()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  public async getList(_req: Request, res: Response) {
    const accounts = await this.accountService.getList()
    return ResponseTransformer.success(res, accounts, 'Get account list successfully')
  }

  public async getMe(req: AuthenticatedRequest, res: Response) {
    const result = await this.accountService.getMe(req.user._id)
    return ResponseTransformer.success(res, result, 'Get me successfully')
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response) {
    const result = await this.accountService.updateProfile(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, result, 'Update profile successfully')
  }

  public async updateSelectedVoice(req: AuthenticatedRequest, res: Response) {
    await this.accountService.updateSelectedVoice(req.user._id, req.validated.body)
    return ResponseTransformer.successNoData(res, 'Select voice successfully')
  }
}
