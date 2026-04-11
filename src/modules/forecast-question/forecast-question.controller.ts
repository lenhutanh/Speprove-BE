import { singleton } from 'tsyringe'
import { ForecastQuestionService } from './forecast-question.service'
import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'

@singleton()
export class ForecastQuestionController {
  constructor(private readonly forecastQuestionService: ForecastQuestionService) {}

  public async getList(req: Request, res: Response) {
    const result = await this.forecastQuestionService.getList(req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get questions by forecast topic')
  }

  public async getDetails(req: Request, res: Response) {
    const forecastQuestion = await this.forecastQuestionService.getDetails(req.params.id, req.validated.query.voiceId)
    return ResponseTransformer.success(res, forecastQuestion, 'Get forecast question details successfully')
  }
}
