import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { topicService } from '~/services'
import { TopicsQueryType } from '~/types'
import { parseQueryParams } from '~/utils'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created topic successfully', topic))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await topicService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated topic successfully', topic))
  } catch (error) {
    next(error)
  }
}

const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryData = parseQueryParams<TopicsQueryType>(req.validated.query)
    const result = await topicService.getList(queryData)
    res.status(StatusCodes.OK).json(new ApiResponse('Get topic list successfully!', result.items, result.meta))
  } catch (error) {
    next(error)
  }
}

export const topicController = {
  createNew,
  update,
  getList,
}
