import { StatusCodes } from 'http-status-codes'
import { Topic } from '~/models'
import { CreateTopicBodyType, UpdateTopicBodyType } from '~/types'
import { ApiError } from '~/utils/api-error'

const createNew = async (data: CreateTopicBodyType) => {
  const existed = await Topic.findOne({ name: data.name })
  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, 'Topic name already exists')
  }

  return await Topic.create(data)
}

const update = async (id: string, data: UpdateTopicBodyType) => {
  const topic = await Topic.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!topic) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Topic not found')
  }
  return topic
}

export const topicService = {
  createNew,
  update
}
