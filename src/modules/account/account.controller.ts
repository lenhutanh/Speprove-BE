import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { injectable } from 'tsyringe'
import { AccountService } from './account.service'
import { AccountMapper } from './account.mapper'

@injectable()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountMapper: AccountMapper
  ) {}

  public async getList(req: Request, res: Response) {
    const accounts = await this.accountService.getList()
    return ResponseTransformer.success(
      res,
      this.accountMapper.toResponseList(accounts),
      'Get account list successfully'
    )
  }

  public async getMe(req: Request, res: Response) {
    const account = await this.accountService.getMe(req.user!._id)
    return ResponseTransformer.success(res, this.accountMapper.toResponse(account), 'Get me successfully')
  }
}
