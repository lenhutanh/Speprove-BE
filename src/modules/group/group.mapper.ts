import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base/base.mapper'
import { GroupResponseDto } from './group.dto'
import { GroupType } from './group.model'

@singleton()
export class GroupMapper extends BaseMapper<GroupType, GroupResponseDto> {
  toResponse(entity: GroupType): GroupResponseDto {
    return {
      id: entity._id.toString(),
      name: entity.name,
      description: entity.description || '',
      kind: entity.kind,
      permissions: entity.permissionIds.map((p: any) => {
        return p && typeof p === 'object' && 'pCode' in p ? p.pCode : p.toString()
      })
    }
  }
}
