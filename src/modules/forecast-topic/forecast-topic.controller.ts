import { singleton } from 'tsyringe'
import { ForecastTopicService } from './forecast-topic.service'
import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'

@singleton()
export class ForecastTopicController {
  constructor(private readonly forecastTopicService: ForecastTopicService) {}

  public async getList(req: Request, res: Response) {
    const result = await this.forecastTopicService.getList(req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get topics by forecast successfully')
  }

  public async getDetails(req: Request, res: Response) {
    const forecastTopic = await this.forecastTopicService.getDetails(req.validated.params.id)
    return ResponseTransformer.success(res, forecastTopic, 'Get forecast topic details successfully')
  }
}
