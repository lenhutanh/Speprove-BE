import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { singleton } from 'tsyringe'
import { AccountService } from './account.service'

@singleton()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  public async getList(req: Request, res: Response) {
    const accounts = await this.accountService.getList()
    return ResponseTransformer.success(res, accounts, 'Get account list successfully')
  }

  public async getMe(req: Request, res: Response) {
    const result = await this.accountService.getMe(req.user!._id)
    return ResponseTransformer.success(res, result, 'Get me successfully')
  }
}
