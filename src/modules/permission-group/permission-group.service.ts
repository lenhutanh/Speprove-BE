import { StatusCodes } from 'http-status-codes'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { IPermissionGroupRepository } from './repositories/permission-group.repository.interface'
import { CreatePermissionGroupBodyType, UpdatePermissionGroupBodyType } from './types/permission-group.type'
import { AppError } from '~/common/errors'

@singleton()
export class PermissionGroupService {
  constructor(
    @inject(TOKENS.IPermissionGroupRepository) private readonly permissionGroupRepository: IPermissionGroupRepository
  ) {}
  async createNew(data: CreatePermissionGroupBodyType) {
    const existed = await this.permissionGroupRepository.findOne({ name: data.name })
    if (existed) {
      throw new AppError('Permission group already exists', StatusCodes.CONFLICT)
    }
    return await this.permissionGroupRepository.create(data)
  }

  // async getList() {
  //   return await this.permissionGroupRepository.findMany({})
  // }

  async getDetails(id: string) {
    const permissionGroup = await this.permissionGroupRepository.findById(id)
    if (!permissionGroup) {
      throw new AppError('Permission group not found', StatusCodes.NOT_FOUND)
    }
    return permissionGroup
  }

  async update(id: string, data: UpdatePermissionGroupBodyType) {
    const permission = await this.permissionGroupRepository.updateById(id, data)
    if (!permission) {
      throw new AppError('Permission group not found', StatusCodes.NOT_FOUND)
    }
    return permission
  }

  async remove(id: string) {
    const deleted = await this.permissionGroupRepository.softDeleteById(id)
    if (!deleted) {
      throw new AppError('Permission group not found', StatusCodes.NOT_FOUND)
    }
  }
}
