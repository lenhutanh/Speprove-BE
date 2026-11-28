import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { PermissionGroupRepository } from './permission-group.repository'

export const registerPermissionGroupModule = () => {
  container.registerSingleton(TOKENS.IPermissionGroupRepository, PermissionGroupRepository)
}
