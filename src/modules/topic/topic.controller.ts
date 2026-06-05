import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseTransformer } from '~/common/http'
import { TopicService } from './topic.service'
import { injectable } from 'tsyringe'

@injectable()
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  public async createNew(req: Request, res: Response) {
    const topic = await this.topicService.createNew(req.validated.body)
    return ResponseTransformer.success(res, topic, 'Create topic successfully', StatusCodes.CREATED)
  }

  public async update(req: Request, res: Response) {
    const topic = await this.topicService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, topic, 'Update topic successfully')
  }

  public async getList(req: Request, res: Response) {
    const result = await this.topicService.getList(req.validated.query)
    return ResponseTransformer.paginate(res, result.data, result.pagination, 'Get topic list successfully')
  }
}
