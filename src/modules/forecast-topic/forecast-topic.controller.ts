import { singleton } from 'tsyringe'
import { ForecastTopicService } from './forecast-topic.service'
import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/utils'
import { ForecastQuestionService } from '../forecast-question/forecast-question.service'

@singleton()
export class ForecastTopicController {
  constructor(
    private readonly forecastTopicService: ForecastTopicService,
    private readonly forecastQuestionService: ForecastQuestionService
  ) {}

  public async getList(req: Request, res: Response) {
    const result = await this.forecastTopicService.getList(req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get topics by forecast successfully')
  }

  public async importQuestions(req: Request, res: Response) {
    await this.forecastQuestionService.importQuestions(req.params.id, req.validated.body.questions)
    return ResponseTransformer.successNoData(res, 'Questions imported successfully')
  }

  public async getDetails(req: Request, res: Response) {
    const forecastTopic = await this.forecastTopicService.getDetails(req.params.id)
    return ResponseTransformer.success(res, forecastTopic, 'Get forecast topic details successfully')
  }
}
