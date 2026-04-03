import { StatusCodes } from 'http-status-codes'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IPermissionRepository } from './repositories/permission.repository.interface'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from './types/permission.type'
import { AppError } from '~/common/errors'
import { toObjectId } from '~/common/utils'

@singleton()
export class PermissionService {
  constructor(@inject(TOKENS.IPermissionRepository) private readonly permissionRepository: IPermissionRepository) {}
  public async createNew(data: CreatePermissionBodyType) {
    const existed = await this.permissionRepository.findOne({
      $or: [{ name: data.name }, { pCode: data.pCode }]
    })

    if (existed) {
      throw new AppError('Permission already exists', StatusCodes.CONFLICT)
    }

    const createData = {
      ...data,
      permissionGroupId: toObjectId(data.permissionGroupId)
    }
    return await this.permissionRepository.create(createData)
  }

  public async getList() {
    return await this.permissionRepository.findMany({})
  }

  public async getDetails(id: string) {
    const permission = await this.permissionRepository.findById(id)
    if (!permission) {
      throw new AppError('Permission not found', StatusCodes.NOT_FOUND)
    }
    return permission
  }

  public async update(id: string, data: UpdatePermissionBodyType) {
    const permission = await this.permissionRepository.updateById(id, data)
    if (!permission) {
      throw new AppError('Permission not found', StatusCodes.NOT_FOUND)
    }
    return permission
  }

  public async remove(id: string) {
    const deleted = await this.permissionRepository.softDeleteById(id)
    if (!deleted) {
      throw new AppError('Permission not found', StatusCodes.NOT_FOUND)
    }
  }
}
