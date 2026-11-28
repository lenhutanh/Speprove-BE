import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'tsyringe'
import { ResponseTransformer } from '~/core/http/response-transformer.util'
import { GroupService } from '~/modules/account/group/group.service'

@injectable()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  public async createNew(req: Request, res: Response) {
    const group = await this.groupService.createNew(req.validated.body)
    return ResponseTransformer.success(res, group, 'Create group successfully', StatusCodes.CREATED)
  }

  public async getDetails(req: Request, res: Response) {
    const group = await this.groupService.getDetails(req.validated.params.id)
    return ResponseTransformer.success(res, group, 'Get group details successfully')
  }

  public async update(req: Request, res: Response) {
    const group = await this.groupService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, group, 'Update group successfully')
  }

  public async remove(req: Request, res: Response) {
    await this.groupService.remove(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Delete group successfully')
  }
}
