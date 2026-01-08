import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/api-error'
import { Account } from '~/models/account.model'
import { groupService } from './group.service'
import { GROUP_NAME, STATUS } from '~/constants/constants'
import { accountResSchema, AccountResType } from '~/types'

const createUser = async (data: any) => {
  const group = await groupService.findByName(GROUP_NAME.USER)
  const newData = {
    ...data,
    username: data.email.split('@')[0],
    status: STATUS.ACTIVE,
    group
  }
  const account = await Account.create(newData)
  return account
}

const getAll = async () => {
  return await Account.find({}).select('-password').populate('group', 'name description')
}

const getMe = async (id: string) => {
  const account = await Account.findById(id)
    .select('-password')
    .populate({
      path: 'group',
      populate: { path: 'permissions' }
    })

  if (!account) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  }

  return accountResSchema.parse(account) as AccountResType
}

const findByEmail = async (email: string) => {
  return await Account.findOne({ email })
    .select('+password')
    .populate({
      path: 'group',
      populate: {
        path: 'permissions'
      }
    })
}

export const accountService = {
  createUser,
  getAll,
  getMe,
  findByEmail
}
