import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'tsyringe'
import { ResponseTransformer } from '~/common/http'
import { GroupService } from '~/modules/group/group.service'

@injectable()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  public async createNew(req: Request, res: Response) {
    const group = await this.groupService.createNew(req.validated.body)
    return ResponseTransformer.success(res, group, 'Create group successfully', StatusCodes.CREATED)
  }

  // public async getList(_req: Request, res: Response) {
  //   const groups = await this.groupService.getList()
  //   return ResponseTransformer.success(res, groups, 'Get group list successfully')
  // }

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
