import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'tsyringe'
import { ResponseTransformer } from '~/common/utils'
import { PermissionGroupService } from '~/modules/permission-group/permission-group.service'

@injectable()
export class PermissionGroupController {
  constructor(private readonly permissionGroupService: PermissionGroupService) {}

  public async createNew(req: Request, res: Response) {
    const permissionGroup = await this.permissionGroupService.createNew(req.validated.body)
    return ResponseTransformer.success(
      res,
      permissionGroup,
      'Create permission group successfully',
      StatusCodes.CREATED
    )
  }

  // public async getList(_req: Request, res: Response) {
  //   const permissionGroups = await this.permissionGroupService.getList()
  //   return ResponseTransformer.success(res, permissionGroups, 'Get permission group list successfully')
  // }

  public async getDetails(req: Request, res: Response) {
    const permissionGroup = await this.permissionGroupService.getDetails(req.validated.params.id)
    return ResponseTransformer.success(res, permissionGroup, 'Get permission group details successfully')
  }

  public async update(req: Request, res: Response) {
    const permissionGroup = await this.permissionGroupService.update(req.validated.params.id, req.validated.body)
    return ResponseTransformer.success(res, permissionGroup, 'Updated permission group successfully')
  }

  public async remove(req: Request, res: Response) {
    await this.permissionGroupService.remove(req.validated.params.id)
    return ResponseTransformer.successNoData(res, 'Delete permission group successfully')
  }
}
