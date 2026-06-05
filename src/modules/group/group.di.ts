import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { GroupRepository } from './repositories/group.repository'

export const registerGroupModule = () => {
  container.registerSingleton(TOKENS.IGroupRepository, GroupRepository)
}
