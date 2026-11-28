import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { GroupRepository } from './group.repository'

export const registerGroupModule = () => {
  container.registerSingleton(TOKENS.IGroupRepository, GroupRepository)
}
