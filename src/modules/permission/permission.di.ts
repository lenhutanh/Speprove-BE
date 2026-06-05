import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { PermissionRepository } from './repositories/permission.repository'

export const registerPermissionModule = () => {
  container.registerSingleton(TOKENS.IPermissionRepository, PermissionRepository)
}

