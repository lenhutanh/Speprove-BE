import { singleton } from 'tsyringe'
import { CreditPackageService } from './credit-package.service'
import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { StatusCodes } from 'http-status-codes'

@singleton()
export class CreditPackageController {
  constructor(private readonly creditPackageService: CreditPackageService) {}

  public async create(req: Request, res: Response) {
    const creditPackage = await this.creditPackageService.create(req.validated.body)
    return ResponseTransformer.success(res, creditPackage, 'Create credit package successfully', StatusCodes.CREATED)
  }

  public async getAll(req: Request, res: Response) {
    const result = await this.creditPackageService.getAll()
    return ResponseTransformer.success(res, result, 'Get all credit packages successfully')
  }
}
