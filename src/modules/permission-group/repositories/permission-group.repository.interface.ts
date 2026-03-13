import { IBaseRepository } from '~/common/base/base.repository.interface'
import { PermissionGroupType } from '../permission-group.model'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPermissionGroupRepository extends IBaseRepository<PermissionGroupType> {}
