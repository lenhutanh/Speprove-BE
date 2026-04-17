import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { ICreditPackageRepository } from './credit-package.repository.interface'
import { CreateCreditPackageBodyType } from './credit-package.type'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '~/common/errors'

@singleton()
export class CreditPackageService {
  constructor(
    @inject(TOKENS.ICreditPackageRepository)
    private readonly creditPackageRepository: ICreditPackageRepository
  ) {}

  public async create(data: CreateCreditPackageBodyType) {
    const creditPackage = await this.creditPackageRepository.create(data)
    return creditPackage
  }

  public async getAll() {
    const result = await this.creditPackageRepository.findMany({ isActive: true })
    return result
  }

  public async getDetails(id: string) {
    const creditPackage = await this.creditPackageRepository.findById(id)
    if (!creditPackage) throw new AppError('Credit package not found', StatusCodes.NOT_FOUND)
    if (!creditPackage.isActive) throw new AppError('Credit package is inactive', StatusCodes.BAD_REQUEST)

    return creditPackage
  }
}
