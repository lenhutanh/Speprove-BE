import { StatusCodes } from 'http-status-codes'
import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { IGroupRepository } from './repositories/group.repository.interface'
import { CreateGroupBodyType, UpdateGroupBodyType } from './types/group.type'
import { AppError } from '~/common/errors'
import { toObjectIds } from '~/common/utils'

@singleton()
export class GroupService {
  constructor(@inject(TOKENS.IGroupRepository) private readonly groupRepository: IGroupRepository) {}
  public async createNew(data: CreateGroupBodyType) {
    const existed = await this.groupRepository.findOne({ name: data.name })
    if (existed) {
      throw new AppError('Group name already exists', StatusCodes.CONFLICT)
    }

    const createData = {
      ...data,
      permissionIds: toObjectIds(data.permissionIds)
    }
    const group = await this.groupRepository.create(createData, {
      populate: 'permissionIds'
    })

    return group
  }

  // async getList() {
  //   return await this.groupRepository.find({}).sort({ createdAt: -1 })
  // }

  async getDetails(id: string) {
    const group = await this.groupRepository.findById(id, {
      populate: 'permissionIds'
    })

    if (!group) {
      throw new AppError('Group not found', StatusCodes.NOT_FOUND)
    }

    return group
  }

  async update(id: string, data: UpdateGroupBodyType) {
    const group = await this.groupRepository.updateById(id, data, {
      populate: 'permissionIds'
    })

    if (!group) {
      throw new AppError('Group not found', StatusCodes.NOT_FOUND)
    }

    return group
  }

  async remove(id: string) {
    const deleted = await this.groupRepository.softDeleteById(id)

    if (!deleted) {
      throw new AppError('Group not found', StatusCodes.NOT_FOUND)
    }
  }

  async findByName(name: string) {
    return await this.groupRepository.findOne({ name })
  }
}
