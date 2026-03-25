import { BaseMapper } from '~/common/base/base.mapper'
import { AccountType } from './account.model'
import { AccountResponseDto } from './account.dto'
import { singleton } from 'tsyringe'
import { GroupMapper } from '../group/group.mapper'

@singleton()
export class  AccountMapper extends BaseMapper<AccountType, AccountResponseDto> {
  constructor(private readonly groupMapper: GroupMapper) {
    super()
  }

  toResponse(entity: AccountType): AccountResponseDto {
    const isPopulated = entity.groupId && typeof entity.groupId === 'object' && '_id' in entity.groupId
    const isAvatarPopulated = entity.avatarId && typeof entity.avatarId === 'object' && 'url' in entity.avatarId
    return {
      id: entity._id.toString(),
      username: entity.username,
      email: entity.email,
      fullName: entity.fullName || '',
      avatarUrl: isAvatarPopulated ? (entity.avatarId as any).url : '',
      kind: entity.kind,
      status: entity.status,
      group: isPopulated ? this.groupMapper.toResponse(entity.groupId as any) : null,
      isSuperAdmin: !!entity.isSuperAdmin,
      createdAt: entity.createdAt?.toISOString() || ''
    }
  }
}
