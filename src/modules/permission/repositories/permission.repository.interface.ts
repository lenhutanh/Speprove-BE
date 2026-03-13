import { IBaseRepository } from '~/common/base/base.repository.interface'
import { PermissionType } from '../permission.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPermissionRepository extends IBaseRepository<PermissionType> {}
