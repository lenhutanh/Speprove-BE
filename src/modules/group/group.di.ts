import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { GroupRepository } from './repositories/group.repository'

export const registerGroupModule = () => {
  container.registerSingleton(TOKENS.IGroupRepository, GroupRepository)
}
