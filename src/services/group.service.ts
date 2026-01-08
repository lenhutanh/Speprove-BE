import { StatusCodes } from 'http-status-codes'
import { Group } from '~/models/group.model'
import { CreateGroupBodyType, UpdateGroupBodyType } from '~/types'
import { ApiError } from '~/utils/api-error'

const createNew = async (data: CreateGroupBodyType) => {
  const existed = await Group.findOne({ name: data.name })
  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, 'Group name already exists')
  }

  const group = await Group.create({
    ...data,
    permissions: data.permissionIds ?? []
  })

  return await group.populate('permissions')
}

const getAll = async () => {
  return await Group.find({}).sort({ createdAt: -1 })
}

const getDetails = async (id: string) => {
  const group = await Group.findById(id).populate('permissions')
  if (!group) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found')
  }
  return group
}

const update = async (id: string, data: UpdateGroupBodyType) => {
  const updateData: any = {
    ...data
  }

  if (data.permissionIds) {
    updateData.permissions = data.permissionIds
  }

  const group = await Group.findByIdAndUpdate(id, updateData, {
    new: true
  }).populate('permissions')

  if (!group) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found')
  }

  return group
}

const remove = async (id: string) => {
  const deleted = await Group.findByIdAndDelete(id)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found')
  }
}

const findByName = async (name: string) => {
  return await Group.findOne({ name })
}

export const groupService = {
  createNew,
  getAll,
  getDetails,
  update,
  remove,
  findByName
}
