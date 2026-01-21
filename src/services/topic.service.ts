import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import { Topic } from '~/models'
import { CreateTopicBodyType, UpdateTopicBodyType } from '~/types'
import { getSearchQuery } from '~/utils'
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

const getList = async (query: any) => {
  const { limit, skip, sort, search, filters } = query
  const { part, forecastId, ...topicFilters } = filters || {}

  const topicMatch: any = {
    ...topicFilters,
    ...getSearchQuery(search, ['name'])
  }

  if (forecastId) {
    topicMatch.forecastIds = new Types.ObjectId(forecastId)
  }

  const pipeline: any[] = [
    { $match: topicMatch },
    { $sort: sort },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },

          ...(part
            ? [
                {
                  $lookup: {
                    from: 'questions',
                    let: { topicId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ['$topicId', '$$topicId'] }, { $eq: ['$part', Number(part)] }]
                          }
                        }
                      }
                    ],
                    as: 'questions'
                  }
                },
                {
                  $project: {
                    name: 1,
                    status: 1,
                    part: Number(part),
                    questions: 1,
                    questionsCount: { $size: '$questions' }
                  }
                }
              ]
            : [
                {
                  $project: {
                    name: 1,
                    status: 1
                  }
                }
              ])
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]

  const result = await Topic.aggregate(pipeline)
  const totalElements = result[0].totalCount[0]?.count || 0

  return {
    items: result[0].items,
    meta: {
      totalElements,
      totalPages: Math.ceil(totalElements / limit)
      // currentPart: part ? Number(part) : null
    }
  }
}

export const topicService = {
  createNew,
  update,
  getList,
}
