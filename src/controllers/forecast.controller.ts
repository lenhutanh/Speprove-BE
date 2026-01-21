import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '~/dtos/api-response.dto'
import { forecastService } from '~/services/forecast.service'
import { ForecastQueryType } from '~/types/forecast.type'
import { parseQueryParams } from '~/utils'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forecast = await forecastService.createNew(req.validated.body)
    res.status(StatusCodes.CREATED).json(new ApiResponse('Created forecast successfully!', forecast))
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forecast = await forecastService.update(req.validated.params.id, req.validated.body)
    res.status(StatusCodes.OK).json(new ApiResponse('Updated forecast successfully!', forecast))
  } catch (error) {
    next(error)
  }
}

const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryData = parseQueryParams<ForecastQueryType>(req.validated.query)
    const result = await forecastService.getList(queryData)

    res.status(StatusCodes.OK).json(new ApiResponse('Get forecast list successfully!', result.items, result.meta))
  } catch (error) {
    next(error)
  }
}

export const forecastController = {
  createNew,
  update,
  getList
}
