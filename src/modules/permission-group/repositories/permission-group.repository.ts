import { BaseRepository } from '~/common/base/base.repository'
import { PermissionGroup, PermissionGroupType } from '../permission-group.model'
import { IPermissionGroupRepository } from './permission-group.repository.interface'

export class PermissionGroupRepository
  extends BaseRepository<PermissionGroupType>
  implements IPermissionGroupRepository
{
  constructor() {
    super(PermissionGroup)
  }
}
