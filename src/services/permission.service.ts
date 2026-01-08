import { StatusCodes } from 'http-status-codes'
import { Permission } from '~/models/permission.model'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from '~/types/permission.type'
import { ApiError } from '~/utils/api-error'

const createNew = async (data: CreatePermissionBodyType) => {
  const existed = await Permission.findOne({
    $or: [{ name: data.name }, { pCode: data.pCode }]
  })

  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, 'Permission already exists')
  }

  return await Permission.create(data)
}

const getAll = async () => {
  return await Permission.find({})
}

const getDetails = async (id: string) => {
  const permission = await Permission.findById(id)
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission not found')
  }
  return permission
}

const update = async (id: string, data: UpdatePermissionBodyType) => {
  const permission = await Permission.findByIdAndUpdate(id, data, { new: true })
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission not found')
  }
  return permission
}

const remove = async (id: string) => {
  const deleted = await Permission.findByIdAndDelete(id)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission not found')
  }
}

export const permissionService = {
  createNew,
  getAll,
  getDetails,
  update,
  remove
}
