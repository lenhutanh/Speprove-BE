import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { PermissionRepository } from './permission.repository'

export const registerPermissionModule = () => {
  container.registerSingleton(TOKENS.IPermissionRepository, PermissionRepository)
}
