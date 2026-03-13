import { BaseRepository } from '~/common/base/base.repository'
import { Permission, PermissionType } from '../permission.model'
import { IPermissionRepository } from './permission.repository.interface'

export class PermissionRepository extends BaseRepository<PermissionType> implements IPermissionRepository {
  constructor() {
    super(Permission)
  }
}
