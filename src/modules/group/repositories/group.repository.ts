import { BaseRepository } from '~/common/base/base.repository'
import { Group, GroupType } from '../group.model'
import { IGroupRepository } from './group.repository.interface'

export class GroupRepository extends BaseRepository<GroupType> implements IGroupRepository {
  constructor() {
    super(Group)
  }
}
