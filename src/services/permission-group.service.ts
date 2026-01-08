import { StatusCodes } from 'http-status-codes'
import { PermissionGroup } from '~/models/permission-group.model'
import { CreatePermissionGroupBodyType, UpdatePermissionGroupBodyType } from '~/types'
import { ApiError } from '~/utils/api-error'

const createNew = async (data: CreatePermissionGroupBodyType) => {
  const existed = await PermissionGroup.findOne({ name: data.name })

  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, 'Permission group already exists')
  }

  return await PermissionGroup.create(data)
}

const getAll = async () => {
  return await PermissionGroup.find({})
}

const getDetails = async (id: string) => {
  const permissionGroup = await PermissionGroup.findById(id)
  if (!permissionGroup) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission group not found')
  }
  return permissionGroup
}

const update = async (id: string, data: UpdatePermissionGroupBodyType) => {
  const permission = await PermissionGroup.findByIdAndUpdate(id, data, { new: true })
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission group not found')
  }
  return permission
}

const remove = async (id: string) => {
  const deleted = await PermissionGroup.findByIdAndDelete(id)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission group not found')
  }
}

export const permissionGroupService = {
  createNew,
  getAll,
  getDetails,
  update,
  remove
}
