import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { PermissionGroupRepository } from './repositories/permission-group.repository'

export const registerPermissionGroupModule = () => {
  container.registerSingleton(TOKENS.IPermissionGroupRepository, PermissionGroupRepository)
}
