import { Request, Response } from 'express'
import { ResponseTransformer } from '~/common/http'
import { QuestionService } from './question.service'
import { injectable } from 'tsyringe'

@injectable()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  public async createNew(req: Request, res: Response) {
    const question = await this.questionService.createNew(req.validated.body)
    return ResponseTransformer.success(res, question, 'Create question successfully')
  }

  public async update(req: Request, res: Response) {
    const question = await this.questionService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, question, 'Update question successfully')
  }

  public async getList(req: Request, res: Response) {
    const result = await this.questionService.getList(req.validated.query)
    return ResponseTransformer.success(res, result, 'Get question list successfully')
  }

  public async getQuestionAudio(req: Request, res: Response) {
    const result = await this.questionService.getQuestionAudio(req.validated.params.id, req.validated.query.voiceId)
    return ResponseTransformer.success(res, result, 'Get question audio successfully')
  }
}
