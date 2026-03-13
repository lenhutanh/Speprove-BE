import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'tsyringe'
import { ResponseTransformer } from '~/common/utils'
import { PermissionService } from '~/modules/permission/permission.service'

@injectable()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  public async createNew(req: Request, res: Response) {
    const permission = await this.permissionService.createNew(req.validated.body)
    return ResponseTransformer.success(res, permission, 'Create permission successfully', StatusCodes.CREATED)
  }

  public async getList(_req: Request, res: Response) {
    const permissions = await this.permissionService.getList()
    return ResponseTransformer.success(res, permissions, 'Get permission list successfully')
  }

  public async getDetails(req: Request, res: Response) {
    const permission = await this.permissionService.getDetails(req.validated.params.id)
    return ResponseTransformer.success(res, permission, 'Get permission details successfully')
  }

  public async update(req: Request, res: Response) {
    const permission = await this.permissionService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, permission, 'Update permission successfully')
  }

  public async remove(req: Request, res: Response) {
    await this.permissionService.remove(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Delete permission successfully')
  }
}
