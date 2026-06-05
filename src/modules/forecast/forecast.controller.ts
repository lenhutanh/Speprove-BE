import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ForecastService } from '~/modules/forecast/forecast.service'
import { ResponseTransformer } from '~/common/http'
import { injectable } from 'tsyringe'
import { ForecastTopicService } from '../forecast-topic/forecast-topic.service'

@injectable()
export class ForecastController {
  constructor(
    private readonly forecastService: ForecastService,
    private readonly forecastTopicService: ForecastTopicService
  ) {}

  public async createNew(req: Request, res: Response) {
    const forecast = await this.forecastService.createNew(req.validated.body)
    return ResponseTransformer.success(res, forecast, 'Create forecast successfully', StatusCodes.CREATED)
  }

  public async getDetails(req: Request, res: Response) {
    const forecast = await this.forecastService.getDetails(req.validated.params.id)
    return ResponseTransformer.success(res, forecast, 'Get forecast details successfully')
  }

  // public async update(req: Request, res: Response) {
  //   const forecast = await this.forecastService.update(req.validated.params.id, req.validated.body)
  //   return ResponseTransformer.success(res, forecast, 'Update forecast successfully')
  // }

  public async getList(req: Request, res: Response) {
    const result = await this.forecastService.getList(req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get forecast list successfully')
  }

  public async importTopics(req: Request, res: Response) {
    await this.forecastTopicService.importTopics(req.validated.params.id, req.validated.body.topics)
    return ResponseTransformer.successNoData(res, 'Topics imported successfully')
  }
}
